/** @type {import('@cloudflare/pages-plugin').PagesFunction} */
export async function onRequestGet({ request }) {
  try {
    // 内部请求，读取本Pages站点根目录静态index.json，不走外网
    const staticReq = new Request("/index.json", request);
    const res = await fetch(staticReq);

    if (!res.ok) {
      throw new Error(`读取本地index.json失败 status:${res.status}`);
    }

    const list = await res.json();
    const result = list.map(item => ({
      title: item.title,
      // 返回本站静态资源相对路径，浏览器直接加载，无跨域
      rawUrl: `/${item.jsonFile}`
    }));

    return Response.json(result);
  } catch (err) {
    console.error("/api/list error", err);
    return Response.json([]);
  }
}
