import assert from 'node:assert/strict'
import {chromium,firefox} from 'playwright'
import {preview} from 'vite'
const server=await preview({preview:{host:'127.0.0.1',port:0}})
const origin=`http://127.0.0.1:${server.httpServer.address().port}`
try {for(const engine of [chromium,firefox]) {
 const browser=await engine.launch(engine===chromium?{channel:'msedge'}:{})
 try {const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 await page.goto(origin+'/courses')
 await page.evaluate(()=>sessionStorage.setItem('raya-demo-package-order',JSON.stringify({id:'clean-lesson',status:'paid',outcome:'paid',readyAt:Date.now()-1})))
 await page.reload();await page.getByRole('button',{name:'شروع دوره',exact:true}).click()
 const video=page.locator('video');await video.evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('video').currentTime>0.1)
 const dimensions=await video.evaluate(v=>[v.videoWidth,v.videoHeight]);assert.deepEqual(dimensions,[1280,720],'clean supplied source replaces the walkthrough crop')
 for(const [time,text] of [[.5,'اول مهارت هر فرد را بشناس.'],[3,'بعد، نقش مناسب را به او بسپار.']]) {
  await video.evaluate((v,t)=>{v.pause();v.currentTime=t},time)
  await page.waitForFunction(text=>Array.from(document.querySelector('video').textTracks[0]?.activeCues??[]).some(c=>c.text===text),text,{timeout:5000})
 }
 assert.equal(await video.evaluate(v=>v.textTracks[0].mode),'showing')
 await page.getByRole('button',{name:'تمام‌صفحه',exact:true}).click()
 await page.waitForFunction(()=>document.fullscreenElement?.getBoundingClientRect().width>0)
 const fullscreenVideo=await video.boundingBox()
 assert.ok(Math.abs(fullscreenVideo.width/fullscreenVideo.height-16/9)<0.05,'portrait fullscreen captions stay attached to the native-ratio media surface')
 assert.equal(await video.evaluate(v=>v.textTracks[0].mode),'showing')
 await page.evaluate(()=>document.exitFullscreen())
 console.log(engine.name(),'clean lesson source, timed Persian captions and fullscreen passed')
 } finally {await browser.close()}
}} finally {await server.close()}
