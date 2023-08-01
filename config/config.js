export default {
  osmosisd_use_custom_rpc: false,
  osmosisd_custom_rpc_url: "https://rpc.cosmos.directory/osmosis",
  host: "localhost",
  port: 9001,
  testParams: {
    wallet: "osmo1vwrruj48vk8q49a7g8z08284wlvm9s6el6c7ej",
  },
  retry: {
    maxRetries: 5,
    intervalSeconds: 5,
  },
};
