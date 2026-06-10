const BASE = "https://base.zenkit.com/api/v1";

export async function zenkitFetch(path: string, opts?: RequestInit) {
  const apiKey = process.env.ZENKIT_API_KEY;
  if (!apiKey) throw new Error("ZENKIT_API_KEY não configurada");

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Zenkit-API-Key": apiKey,
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });

  if (res.status === 401) throw new Error("API key inválida ou sem permissão");
  if (res.status === 429) throw new Error("Rate limit atingido — aguarde e tente novamente");
  if (!res.ok) throw new Error(`Zenkit API erro ${res.status}: ${await res.text()}`);

  return res.json();
}

export async function listarWorkspaces() {
  return zenkitFetch("/users/me/workspacesWithLists");
}

export async function listarItens(listId: string) {
  return zenkitFetch(`/lists/${listId}/entries/filter/list`, {
    method: "POST",
    body: JSON.stringify({ skip: 0, limit: 1000, filter: {} }),
  });
}

export async function buscarCampos(listId: string) {
  return zenkitFetch(`/lists/${listId}/elements`);
}
