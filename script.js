function createbyteArr(uint8arr) {
  if (!uint8arr) {
    return [];
  }

  var arr = [];
  for (var i = 0; i < uint8arr.length; i++) {
    var val = uint8arr[i] & 0xff;
    arr.push(val);
  }

  return arr;
}

function leviathan(time, body, did, iid) {
  return new Promise(function (resolve, reject) {
    Java.perform(function () {
      const type = Java.use("com.ss.sys.ces.a");

      Java.use(
        "com.ss.android.common.applog.AppLog"
      ).getServerDeviceId.implementation = function () {
        return did;
      };

      Java.use(
        "com.ss.android.common.applog.AppLog"
      ).getInstallId.implementation = function () {
        return iid;
      };

      Java.use("com.ss.android.ugc.aweme.app.application.task.a").$new().run();

      var sec = Java.cast(
        Java.use("com.ss.android.ugc.aweme.framework.services.ServiceManager")
          .get()
          .getService(
            Java.use("com.ss.android.ugc.aweme.secapi.ISecApi").class
          ),
        Java.use("com.ss.android.ugc.aweme.secapi.ISecApi")
      );

      const result = type.leviathan(
        // -1,
        parseInt(time),
        Java.array("byte", body)
      );
      resolve(createbyteArr(result));
    });
  });
}

function ttEncrypt(body) {
  return new Promise(function (resolve, reject) {
    Java.perform(function () {
      const type = Java.use(
        "com.bytedance.frameworks.core.encrypt.TTEncryptUtils"
      );
      const result = type.a(Java.array("byte", body), body.length);
      resolve(createbyteArr(result));
    });
  });
}

rpc.exports = {
  leviathan: function (time, body, did, iid) {
    return leviathan(time, body, did, iid);
  },
  ttEncrypt: function (body) {
    return ttEncrypt(body);
  },
};
