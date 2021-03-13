import _, { random } from 'lodash';
import { getProxyURL, getMaster1200 } from './pximg';
import CQcode from '../CQcode';
import { URL } from 'url';
import NamedRegExp from 'named-regexp-groups';
import '../utils/jimp.plugin';
import Jimp from 'jimp';
const Axios = require('../axiosProxy');

const zza = Buffer.from('aHR0cHM6Ly9pbWcucGF1bHp6aC50ZWNoL3RvdWhvdS9yYW5kb20=', 'base64').toString('utf8');

const PIXIV_404 = Symbol('Pixiv image 404');

async function imgAntiShielding(url) {
  const img = await Jimp.read(url);

  switch (Number(global.config.bot.setu.antiShielding)) {
    case 1:
      const [w, h] = [img.getWidth(), img.getHeight()];
      const pixels = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
      ];
      for (const [x, y] of pixels) {
        img.setPixelColor(Jimp.rgbaToInt(random(255), random(255), random(255), 1), x, y);
      }
      break;

    case 2:
      img.simpleRotate(90);
      break;
  }

  return (await img.getBase64Async(Jimp.AUTO)).split(',')[1];
}

//  酷Q无法以 base64 发送大于 4M 的图片
function checkBase64RealSize(base64) {
  return base64.length && base64.length * 0.75 < 4000000;
}

async function getAntiShieldingBase64(url) {
  const setting = global.config.bot.acg;
  if (setting.antiShielding) {
    try {
      const origBase64 = await imgAntiShielding(url);
      if (checkBase64RealSize(origBase64)) return origBase64;
    } catch (error) {
      // 原图过大
    }
    if (setting.size1200) return false;
    const m1200Base64 = await imgAntiShielding(getMaster1200(url));
    if (checkBase64RealSize(m1200Base64)) return m1200Base64;
  }
  return false;
}

function sendAcg(context, logger) {
  const setting = global.config.bot.acg;
  const replys = global.config.bot.replys;
  const acgReg = new NamedRegExp(global.config.bot.regs.acg);
  const acgRegExec = acgReg.exec(context.message);
  if (acgRegExec) {
    // 普通
    const limit = {
      value: setting.limit,
      cd: setting.cd,
    };
    let delTime = setting.deleteTime;

    const regGroup = acgRegExec.groups || {};
    const size = (regGroup.size && regGroup.size.replace(/(横屏|背景|)/, 'pc').replace(/(手机|竖屏|)/, 'wap')) || 'all';
    const keyword = (regGroup.tag && `&tag=${encodeURIComponent(regGroup.tag)}`) || false;

    // 私聊
    if (!context.group_id) {
      if (!setting.allowPM) {
        global.replyMsg(context, replys.setuReject);
        return true;
      }
      limit.cd = 0; // 私聊无cd
    }

    if (!logger.canSearch(context.user_id, limit, 'setu')) {
      global.replyMsg(context, replys.setuLimit, true);
      return true;
    }

    Axios.get(
      `${zza}?type=json&site=all&size=${size}${keyword || ''}`
    )
      .then(ret => ret.data)
      .then(async ret => {

        global.replyMsg(context, `${ret.url} (author${ret.author})`, true);

        // 反和谐
        const base64 = await getAntiShieldingBase64(url).catch(e => {
          console.error(`${global.getTime()} [error] anti shielding`);
          console.error(e);
          if (String(e).includes('Could not find MIME for Buffer')) return PIXIV_404;
          global.replyMsg(context, '反和谐发生错误，图片将原样发送，详情请查看错误日志');
          return false;
        });

        if (base64 === PIXIV_404) {
          global.replyMsg(context, '图片发送失败，可能是网络问题/插画已被删除/原图地址失效');
          return;
        }

        const imgType = delTime === -1 ? 'flash' : null;
        global
          .replyMsg(context, base64 ? CQcode.img64(base64, imgType) : CQcode.img(url, imgType))
          .then(r => {
            const message_id = _.get(r, 'data.message_id');
            // if (delTime > 0 && message_id)
            //   setTimeout(() => {
            //     global.bot('delete_msg', { message_id });
            //   }, delTime * 1000);
          })
          .catch(e => {
            console.error(`${global.getTime()} [error] delete msg`);
            console.error(e);
          });
        logger.doneSearch(context.user_id, 'acg');
      })
      .catch(e => {
        console.error(`${global.getTime()} [error]`);
        console.error(e);
        global.replyMsg(context, replys.setuError, true);
      });
    return true;
  }
  return false;
}

export default sendAcg;
