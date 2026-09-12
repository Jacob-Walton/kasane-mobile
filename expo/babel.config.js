// babel-preset-expo carries the router transform, which is what sets EXPO_ROUTER_APP_ROOT.
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
