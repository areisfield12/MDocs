import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOctokitForRepo } from "@/lib/github-app";
import { formatGitHubError, encodeBase64 } from "@/lib/utils";

interface CommitBody {
  path: string;
  content: string;
  sha: string;
  branch: string;
  message?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { owner, repo } = await params;

  let body: CommitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request", actionable: "Please try again." }, { status: 400 });
  }

  const { path, content, sha, branch, message } = body;

  if (!path || !content || !sha || !branch) {
    return NextResponse.json(
      { error: "Missing required fields", actionable: "Reload the page and try again." },
      { status: 400 }
    );
  }

  try {
    const octokit = await getOctokitForRepo(owner);

    const filename = path.split("/").pop() ?? path;
    const commitMessage =
      message ?? `Update ${filename} via Commit`;

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: commitMessage,
      content: encodeBase64(content),
      sha,
      branch,
    });

    return NextResponse.json({
      sha: data.commit.sha,
      url: data.commit.html_url,
      message: commitMessage,
      fileSha: data.content?.sha,
    });
  } catch (error) {
    const friendly = formatGitHubError(error);
    return NextResponse.json(friendly, { status: 500 });
  }
}
