# cohere2openai
A cloudflare worker to covert cohere api to openai api
[中文文档](./README_ZH.md)

# How to use

1. Create a new worker in cloudflare
2. Copy the code in `worker.js` to the worker
3. Setting environment variables in the worker
   - `API_AUTH_TOKEN`: your cohere api key
4. Deploy the worker
5. Use the worker url as the api endpoint
6. Band custom domain to the worker if needed (Optional)

# Something you must know

I force the worker to use `command-r-plus` model, the code is [here](https://github.com/beanqi/cohere2openai/blob/8880315a0ead2f62c8243c249e06374de7ce77d3/worker.js#L52), you can annotate it if you want to use other models.

