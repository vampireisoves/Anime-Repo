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

    const url = new URL(request.url);
    const file = url.searchParams.get("file");
    if (!file) {
        return Response.json({error:"missing file parameter"}, {status:400});
    }
    const targetUrl = `https://cdn.jsdelivr.net/gh/vampireisoves/Anime-Repo@main/${file}`;
    try{
        const resp = await fetchWithRetry(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const body = await resp.text();
        return new Response(body, {
            headers:{
                "content‑type":"application/json;charset=utf‑8"
            }
        })
    }catch(err){
        return Response.json({error:`访问CDN失败: ${err.message}`},{status:500})
    }
}
