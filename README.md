# 大麦AI选品可研报告

全流程AI选品分析:**数据收集 → 核心因子分析 → 分析报告 → 上架建议**,两个入口:

- `/recommend` —「我应该上架卖什么」:候选池召回 → 批量因子打分 → AI选品委员会横向对比 → 推荐排名
- `/evaluate` —「这个产品怎么样」:单品数据 → 因子分析 → 看多/看空AI辩论 → 决策委员会给出 上架/观察/不上架

## 架构

```
src/lib/data/       数据层。DataSource 接口是唯一的适配边界,当前实现是 MockDataSource
                     (确定性伪随机生成价格/销量时序,同一商品名每次生成结果一致)。
                     接入大麦真实数据库或 Mercado Libre API 时,只需新写一个实现
                     DataSource 接口的类,在 src/lib/data/index.ts 里换掉导出即可,
                     因子引擎和上层流水线不用改一行。

src/lib/factors/    因子引擎。纯确定性代码,把时序数据算成销量趋势、稳定性、价格敏感度、
                     竞争强度、口碑、毛利健康度等可解释因子(0-100分),外加异常峰值检测
                     和数据置信度。LLM 只解读这些数字,不允许自己编数据 —— 这是为了让报告
                     可复现、可解释,不因为模型随机性一次一个结论。

src/lib/llm/        OpenAI兼容协议客户端,同时支持 DeepSeek / 通义千问 / 智谱GLM /
                     OpenAI(通过 LLM_BASE_URL 切换)。没配置 LLM_API_KEY 时自动降级为
                     规则引擎生成文案,不会报错、不会卡住。

src/lib/pipeline/   两条业务流水线,复用同一个因子引擎:
                     - evaluate.ts: 单品 GO/NO-GO 决策(看多agent / 看空agent / 决策agent)
                     - recommend.ts: 候选池排名 + 委员会式横向对比narrative

src/lib/data/mercadolibre/  真实数据源实现(DATA_SOURCE=mercadolibre 时启用)。
                     oauth.ts 管 access_token 刷新,source.ts 实现 DataSource,
                     snapshot-store.ts 是本地历史累积(见下方「关于历史趋势数据」)。
```

## 配置大模型

复制 `.env.example` 为 `.env.local`,填入你的国产大模型 key:

```bash
cp .env.example .env.local
```

`.env.local` 里三选一填 `LLM_BASE_URL`(DeepSeek / 通义千问 / 智谱GLM 的 base_url 已在
`.env.example` 里注好),再填 `LLM_API_KEY` 和对应的 `LLM_MODEL`。不填也能跑,走规则引擎。

## 接入Mercado Libre真实数据

实测过:ML现在几乎所有接口(包括以前免认证的商品搜索/详情)都要求 OAuth access token,
403 forbidden 是常态,没有token什么都拿不到。步骤:

1. 登录你自己的 ML 账号,去 <https://developers.mercadolibre.com.mx> →「Mis aplicaciones」→
   「Crear aplicación」,拿到 `client_id`(App ID)和 `client_secret`,并设置一个
   `redirect_uri`(随便一个能匹配的地址,不需要是真的在跑的页面,比如
   `https://localhost:3001/oauth/callback`)。
2. 浏览器打开(替换成你自己的 client_id / redirect_uri):
   `https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI`
3. 登录授权后会跳转到 `redirect_uri?code=TG-xxxxx`,复制这个 `code`。
4. 用这个 code 换一次 `refresh_token`(只需要做一次):
   ```bash
   curl -X POST https://api.mercadolibre.com/oauth/token \
     -H "accept: application/json" -H "content-type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=THE_CODE&redirect_uri=YOUR_REDIRECT_URI"
   ```
5. 把返回的 `refresh_token` 填进 `.env.local` 的 `ML_REFRESH_TOKEN`,`client_id`/`client_secret`
   也填好,再把 `DATA_SOURCE` 改成 `mercadolibre`,重启 `npm run dev` 即可。

### 关于历史趋势数据(重要,不是bug)

ML官方API不管有没有token,都**只给当前快照**(当前价格、累计总销量),没有"过去60天每日销量"这种接口——这是所有主流平台公开API的通病,不止ML。所以`/evaluate`每次查一个商品,底层会顺手把当天的快照存一份到本地 `.data/snapshots/{itemId}.json`,靠这个逐日累积出真实的销量走势(用相邻两天累计销量的差值算出"日销量")。

也就是说:**接入当天,趋势图只有1个点,因子引擎会正确地把置信度标成"低"**——这不是没做好,是数据本身就得攒。想让没人主动查看的商品也持续攒数据,把商品ID填进 `.env.local` 的 `ML_WATCHLIST_ITEM_IDS`(逗号分隔),再找个免费定时器(cron-job.org 或 GitHub Actions 的 scheduled workflow 都行)每天调一次 `/api/snapshot`。

### 关于毛利率

ML的商品数据里没有"你的进货成本"这个字段,平台不可能知道。`/evaluate` 页面加了一个可选的
「成本价」输入框,填了就用真实成本算毛利;不填的话毛利健康度这个因子会用25%占位值,报告里
会如实体现这是估算值。

## 部署(国内可访问)

之前有个项目部署在 Vercel 上,结果只能走境外网络访问。这次换成能在国内直连的方案:
**腾讯云开发 CloudBase「云托管」**——本质是容器托管(类似 Cloud Run),原生支持 Next.js 的
SSR/API 路由,不是只能跑静态页面。已经在这个项目里配好了:

- `next.config.ts` 加了 `output: "standalone"`(生成最小化的独立服务器产物)
- 根目录 `Dockerfile`(多阶段构建,最终镜像跑 `node server.js`,监听 3000 端口)
- 本地跑 `npm run build` 已验证能正常生成 `.next/standalone/server.js`

部署步骤:

1. 去 [tcb.cloud.tencent.com](https://tcb.cloud.tencent.com) 开通云开发环境(用你自己的腾讯云账号)
2. 「云托管」→ 新建服务,选"从 GitHub 仓库部署"或直接用 CLI(`tcb cloudrun deploy`)上传代码,
   它会读这个项目里现成的 `Dockerfile` 构建
3. 部署完会分配一个形如 `https://xxx.ap-shanghai.run.tcloudbase.com` 的默认域名——**这是腾讯云自己已经备案过的域名,直接就能在国内访问,不需要你自己搞 ICP 备案**
4. 只有你想换成自己的域名(比如 `report.yourdomain.com`)时,才需要走 ICP 备案流程;不换域名的话完全不用管这件事
5. 环境变量(`LLM_API_KEY`、`DATA_SOURCE`、`ML_*` 等)在云托管的服务设置里配,和 `.env.local`
   是同一套 key

`Dockerfile` 是标准的 Next.js standalone 产物,不锁死平台——以后想换成阿里云 SAE / 自建服务器,同一个 Dockerfile 也能直接用。

## 已知的下一步(未实现,预留位置)

- Mercado Libre 適配器目前用 `title` 关键词做竞品搜索,还没有验证真实认证请求返回的字段是否和代码里假设的完全一致(没有真实client_id/secret测试环境),接入后如果字段对不上,改 `src/lib/data/mercadolibre/source.ts` / `client.ts` 里的映射就行,不用动因子引擎和上层
- 亚马逊等其他平台数据源,同样实现一个 `DataSource` 即可接入
- 目前没有鉴权/多用户,报告不落库,刷新即丢失
