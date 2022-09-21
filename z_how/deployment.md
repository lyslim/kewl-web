1. use vercel
    > `npm install -g vercel@latest`

2. add environment variables
    1. create file `.env.local`
    2. add `NEXT_PUBLIC_API_URL=http://localhost:4000/graphql`
    3. use `process.env.NEXT_PUBLIC_API_URL` as API url variable in function `createUrqlClient`

3. test it in browser
   * Note: be care in backend .env file, we maintained `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testkewl1`, this needs to switch to new db `testkewl2`, as we generated and used initial migration script when we deployed backend.

4. `vercel login`

5. `vercel` and choose all default options
    * if build failed, use `vercel logs` to check log
    * run `npm run build` to check the build first, then re-run `vercel`

6. set up API environment variable in vercel

7. `vercel --prod` to deploy to production

8. setup domains(& redirect) in vercel project settings and dns provider

9. fix CORS
    1. provide real domain for `CORS_ORIGIN` in backend file `.env.production`.
    2. re-build backend app docker image, re-push it and re-deploy it to VPS.
