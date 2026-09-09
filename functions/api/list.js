/** @type {import('@cloudflare/pages-plugin').PagesFunction} */
export async function onRequestGet({request}) {
    async function fetchWithRetry(urlStr, opts, retryCount=2) {
        let lastErr;
        for(let i=0;i<=retryCount;i++){
            try{
                const res = await fetch(urlStr, {...opts, signal: AbortSignal.timeout(8000)});
                if(res.ok) return res;
                lastErr = new Error(`HTTP ${res.status}`);
            }catch(e){
                lastErr = e;
            }
            if(i < retryCount) await new Promise(r=>setTimeout(r,600));
        }
        throw lastErr;
    }

    const indexUrl = "https://cdn.jsdelivr.net/gh/vampireisoves/Anime-Repo@main/index.json";
    try {
        const res = await fetchWithRetry(indexUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const list = await res.json();
        const result = list.map(item => {
            return {
                title: item.title,
                rawUrl: `/api/proxy?file=${encodeURIComponent(item.jsonFile)}`
            };
        });
        return Response.json(result);
    } catch (err) {
        console.error("/api/list error", err);
        return Response.json([]);
    }
}
