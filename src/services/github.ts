export interface GitHubRepoMeta {
  fullName: string; // e.g. 'astral-sh/uv'
  name: string; // e.g. 'uv'
  owner: string; // e.g. 'astral-sh'
  ownerAvatar: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  topics: string[];
  githubUrl: string;
  openGraphImage: string;
}

/**
 * Parses a GitHub URL or string like "astral-sh/uv" or "https://github.com/charmbracelet/bubbletea"
 */
export function parseGitHubPath(input: string): { owner: string; repo: string } | null {
  const clean = input.trim().replace(/\/+$/, '');
  const matchUrl = clean.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
  if (matchUrl) {
    return { owner: matchUrl[1], repo: matchUrl[2] };
  }
  const matchShort = clean.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
  if (matchShort) {
    return { owner: matchShort[1], repo: matchShort[2] };
  }
  return null;
}

/**
 * Fetches real GitHub repository details from public REST API
 */
export async function fetchGitHubRepoDetails(owner: string, repo: string): Promise<GitHubRepoMeta | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) return null;
    const data = await res.json();

    return {
      fullName: data.full_name || `${owner}/${repo}`,
      name: data.name,
      owner: data.owner?.login || owner,
      ownerAvatar: data.owner?.avatar_url || 'https://github.githubassets.com/favicons/favicon.png',
      description: data.description || 'No description provided.',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      language: data.language || 'Code',
      topics: data.topics || [],
      githubUrl: data.html_url || `https://github.com/owner/repo`,
      openGraphImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
    };
  } catch (err) {
    console.error('Failed to fetch GitHub repository details:', err);
    return null;
  }
}

/**
 * Searches real GitHub repositories matching a query
 */
export async function searchGitHubRepos(query: string): Promise<GitHubRepoMeta[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=6`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      fullName: item.full_name,
      name: item.name,
      owner: item.owner?.login || 'github',
      ownerAvatar: item.owner?.avatar_url || '',
      description: item.description || '',
      stars: item.stargazers_count || 0,
      forks: item.forks_count || 0,
      openIssues: item.open_issues_count || 0,
      language: item.language || 'Code',
      topics: item.topics || [],
      githubUrl: item.html_url,
      openGraphImage: `https://opengraph.githubassets.com/1/${item.full_name}`,
    }));
  } catch (err) {
    console.error('Error searching GitHub:', err);
    return [];
  }
}
