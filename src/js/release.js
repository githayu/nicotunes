#!/usr/bin/env node

import request from 'request';
import fs from 'fs';
import { exec } from 'child_process';
import config from '../../package.json';

const GITHUB_ACCESSTOKEN = process.env.GITHUB_ACCESS_TOKEN;
const GITHUB_REPO_BRANCH = process.env.CIRCLE_BRANCH;
const GITHUB_USER_NAME = process.env.CIRCLE_PROJECT_USERNAME;
const GITHUB_REPO_NAME = process.env.CIRCLE_PROJECT_REPONAME;
const GITHUB_API_HOST = 'https://api.github.com';

const Headers = {
  'Authorization': `token ${GITHUB_ACCESSTOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'NicoTunes ReleaseBot'
};

const Log = (color, text) => {
  let colors = {
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m'
  };

  console.log(colors[color] + text + '\u001b[0m');
};

// GitHub Releases ID Check
const get_release_id = () => {
  Log('blue', 'get_release_id');

  return new Promise(resolve => {
    request({
      url: `${GITHUB_API_HOST}/repos/${GITHUB_USER_NAME}/${GITHUB_REPO_NAME}/releases/tags/v${config.version}`,
      json: true,
      headers: Headers
    }, (err, res, body) => {
      console.log(body);

      if (res.statusCode === 200) {
        resolve(body.id);
      } else {
        resolve(false);
      }
    });
  });
};

// Delete current release
const delete_release = id => {
  Log('blue', 'delete_release');

  return new Promise((resolve, reject) => {
    request({
      method: 'delete',
      url: `${GITHUB_API_HOST}/repos/${GITHUB_USER_NAME}/${GITHUB_REPO_NAME}/releases/${id}`,
      json: true,
      headers: Headers
    }, (err, res, body) => {
      console.log(body);

      if (res.statusCode === 204) {
        exec(`git tag -d ${config.version} && git push --delete origin ${config.version}`);
        resolve();
      } else {
        reject();
      }
    });
  });
};

// Create new release
const create_release = () => {
  Log('blue', 'create_release');

  return new Promise((resolve, reject) => {
    request.post({
      url: `${GITHUB_API_HOST}/repos/${GITHUB_USER_NAME}/${GITHUB_REPO_NAME}/releases`,
      json: true,
      body: {
        tag_name: `v${config.version}`,
        target_commitish: GITHUB_REPO_BRANCH,
        name: `v${config.version}`,
        draft: false,
        prerelease: GITHUB_REPO_BRANCH === 'develop' ? true : false
      },
      headers: Headers
    }, (err, res, body) => {
      console.log(body);

      if (res.statusCode === 201) {
        resolve(body);
      } else {
        reject();
      }
    });
  });
};

// Upload binary file
const upload_file = url => {
  Log('blue', 'upload_file');

  url = url.replace('{?name,label}', '');

  let releaseDir = process.cwd() + '/dist/release',
      uploadFiles = fs.readdirSync(releaseDir);

  return new Promise.all(uploadFiles.map(file => {
    let filePath = [releaseDir, file].join('/');

    fs.stat(filePath, (fileError, fileInfo) => {
      return new Promise(resolve => {
        if (fileError) return resolve();

        fs.createReadStream(filePath).pipe(request.put({
          url,
          json: true,
          qs: { name: file },
          headers: Object.assign({}, Headers, {
            'Content-Type': 'application/zip',
            'Content-Length': fileInfo.size
          })
        }, (err, res, body) => {
          if (err) console.error(err);
          console.log(body);
          resolve();
        }));
      });
    });
  }));
};

(async () => {
  let id = await get_release_id();

  if (id !== false) await delete_release(id);

  let release = await create_release();

  await upload_file(release.upload_url);
})();
