import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOctokitForRepo } from "@/lib/github-app";
import { formatGitHubError, encodeBase64, generateBranchName } from "@/lib/utils";

interface PRBody {
  path: string;
  content: string;
  sha: string;
  baseBranch: string;
  title: string;
  body: string;
  reviewers?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.githubLogin) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { owner, repo } = await params;

  let body: PRBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request", actionable: "Please try again." }, { status: 400 });
  }

  const { path, content, sha: fileSha, baseBranch, title, body: prBody, reviewers } = body;

  if (!path || !content || !fileSha || !baseBranch || !title) {
    return NextResponse.json(
      { error: "Missing required fields", actionable: "Fill in all required fields and try again." },
      { status: 400 }
    );
  }

  const octokit = await getOctokitForRepo(owner);

  try {
    // Step 1: Get the SHA of the base branch HEAD
    const { data: baseRef } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = baseRef.object.sha;

    // Step 2: Create a new branch
    const branchName = generateBranchName(
      session.user.githubLogin ?? "user",
      path
    );

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // Step 3: Commit the file to the new branch
    const filename = path.split("/").pop() ?? path;
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${filename} via MDocs`,
      content: encodeBase64(content),
      sha: fileSha,
      branch: branchName,
    });

    // Step 4: Create the PR
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body: prBody,
      head: branchName,
      base: baseBranch,
    });

    // Step 5: Request reviewers (if any)
    if (reviewers && reviewers.length > 0) {
      try {
        await octokit.rest.pulls.requestReviewers({
          owner,
          repo,
          pull_number: pr.number,
          reviewers,
        });
      } catch {
        // Non-fatal — PR was created, reviewer assignment just failed
      }
    }

    return NextResponse.json({
      number: pr.number,
      url: pr.html_url,
      title: pr.title,
      branchName,
    });
  } catch (error) {
    const friendly = formatGitHubError(error);
    return NextResponse.json(friendly, { status: 500 });
  }
}
