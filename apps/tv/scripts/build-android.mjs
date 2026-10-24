import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tv = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = resolve(tv, 'android');
const tools = resolve(tv, '../../../.tmp/sunshine-android-tools');
const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? resolve(tools, 'sdk');
const localJdks = resolve(tools, 'jdk17');
const java = process.env.JAVA_HOME ?? (existsSync(localJdks) ? resolve(localJdks, readdirSync(localJdks).find(name => name.startsWith('jdk-')) ?? '') : '');
const environment = { ...process.env, DEBUG: '', TV_BUILD_PLATFORM: 'android', ANDROID_HOME: sdk,
  ANDROID_USER_HOME: resolve(tools, 'user'), GRADLE_USER_HOME: resolve(tools, 'gradle-user') };
if (java) { environment.JAVA_HOME = java; environment.PATH = `${resolve(java, 'bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`; }

function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: tv, stdio: 'inherit', env: environment,
    windowsVerbatimArguments: executable === 'cmd.exe' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (!existsSync(resolve(sdk, 'platforms/android-35/android.jar'))) {
  console.error('Android SDK platform 35 is required. Set ANDROID_HOME and JAVA_HOME (JDK 17).'); process.exit(1);
}
run(process.execPath, ['scripts/prepare-assets.mjs']);
run(process.execPath, ['scripts/check-reservation-config.mjs']);
run(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', 'reservations']);
run(process.execPath, ['scripts/prepare-android.mjs']);
writeFileSync(resolve(project, 'local.properties'), `sdk.dir=${sdk.replaceAll('\\', '/')}\n`);

const wrapper = resolve(project, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
let gradle = wrapper;
const tasks = ['--project-dir', project, '--no-daemon', 'assembleDebug', 'lintDebug'];
if (!existsSync(wrapper)) {
  gradle = resolve(tools, 'gradle/gradle-8.11.1/bin', process.platform === 'win32' ? 'gradle.bat' : 'gradle');
  if (!existsSync(gradle)) { console.error('Gradle 8.11.1 or the project Gradle wrapper is required.'); process.exit(1); }
  const archive = resolve(tools, 'gradle.zip');
  const hash = createHash('sha256').update(readFileSync(archive)).digest('hex');
  tasks.push('wrapper', '--gradle-version', '8.11.1', '--distribution-type', 'bin', '--gradle-distribution-sha256-sum', hash);
}
if (process.platform === 'win32') {
  const quote = value => `"${value.replaceAll('"', '""')}"`;
  run('cmd.exe', ['/d', '/s', '/c', `"${[gradle, ...tasks].map(quote).join(' ')}"`]);
} else run(gradle, tasks);
const version = JSON.parse(readFileSync(resolve(tv, 'package.json'), 'utf8')).version;
const output = resolve(tv, 'artifacts/android'); mkdirSync(output, { recursive: true });
const apk = resolve(output, `sunshine-resort-${version}-android.1-debug.apk`);
copyFileSync(resolve(project, 'app/build/outputs/apk/debug/app-debug.apk'), apk);
console.info(`Android TV test APK: ${apk}`);
