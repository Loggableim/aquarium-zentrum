const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function request(pathname, host='aquaristik-zentrum.com') {
  const { onRequest } = await import(pathToFileURL(path.resolve(__dirname, '../functions/_middleware.js')));
  let nextCalls=0;
  const response=await onRequest({request:new Request(`https://${host}${pathname}`),next:()=>{nextCalls++;return new Response('public asset',{status:200});}});
  return {response,nextCalls};
}
test('raw article redirects to its completed canonical page, preserving the query', async()=>{
 for(const url of ['/content/artikel/nano-aquarium-guide','/content/artikel/nano-aquarium-guide/','/content/artikel/nano-aquarium-guide.html']) {
  const {response,nextCalls}=await request(url+'?ref=old');
  assert.equal(response.status,301);assert.equal(nextCalls,0);
  assert.equal(response.headers.get('location'),'https://aquaristik-zentrum.com/artikel/nano-aquarium-guide/?ref=old');
 }
});
test('template and unknown source URLs are real 404s, never served as assets',async()=>{
 for(const url of ['/_templates/nav','/_templates/nav.html','/_templates/','/content','/content/','/content/not-a-page','/content/artikel/missing.html']){
  const {response,nextCalls}=await request(url);assert.equal(response.status,404,url);assert.equal(nextCalls,0,url);
 }
});
test('encoded internal paths cannot fall through to static delivery',async()=>{
 for(const url of ['/%5ftemplates/nav','/%255ftemplates/nav','//_templates/nav','/content%2fmissing.html','/content%5cmissing.html']){
  const {response,nextCalls}=await request(url);assert.equal(response.status,404,url);assert.equal(nextCalls,0,url);
 }
});
test('ordinary pages, assets, crawler files and verification remain untouched',async()=>{
 for(const url of ['/','/artikel/nano-aquarium-guide','/images/nano-aquarium-guide.webp','/style.css','/app.js','/robots.txt','/sitemap.xml','/ads.txt','/2572b1da71c5c59fcd30e46216bc4db3.txt']){
  const {response,nextCalls}=await request(url);assert.equal(response.status,200,url);assert.equal(nextCalls,1,url);
 }
});
test('existing alternative-domain redirects remain intact',async()=>{
 const {response}=await request('/artikel/nano-aquarium-guide?ref=a','aquarien-zentrum.com');
 assert.equal(response.status,301);assert.equal(response.headers.get('location'),'https://aquaristik-zentrum.com/artikel/nano-aquarium-guide?ref=a');
});

test('generated map stays current and every target exists as a finished public page',async()=>{
 const fs=require('node:fs');
 const {generateContentRoutes}=require('../scripts/generate-content-routes.js');
 const root=path.resolve(__dirname,'..');
 const {default:routes}=await import(pathToFileURL(path.join(root,'data/public-content-routes.mjs')));
 assert.deepEqual(routes,generateContentRoutes(root));
 for(const [source,target] of Object.entries(routes)){
  const local=path.join(root,decodeURIComponent(target).replace(/^\//,'').replace(/\/$/,'')+(target.endsWith('.html')?'':'.html'));
  assert.ok(fs.existsSync(local),source+' -> '+target);
  const {response}=await request(source);assert.equal(response.status,301,source);
 }
});

test('decoded dot segments and deeply encoded paths cannot reveal source files',async()=>{
 const {response,nextCalls}=await request('/foo%2F..%2Fcontent/artikel/nano-aquarium-guide');
 assert.equal(response.status,301);assert.equal(nextCalls,0);
 const result=await request('/%252525255ftemplates/nav');
 assert.equal(result.response.status,404);assert.equal(result.nextCalls,0);
});
