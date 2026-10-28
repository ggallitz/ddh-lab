import {defineConfig} from '@playwright/test';

const port=Number(process.env.DDH_PORT??4178);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('DDH_PORT must be an integer between 1 and 65535');
const url=`http://127.0.0.1:${port}`;

export default defineConfig({
 testDir:'tests/browser',workers:1,
 use:{baseURL:url,headless:true,launchOptions:{
  executablePath:process.env.DDH_CHROMIUM,
  args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']
 }},
 webServer:{
  command:`npm run ${process.env.DDH_BUILD?'preview':'dev'} -- --port ${port} --strictPort`,
  url,reuseExistingServer:false
 },
 reporter:'list'
});
