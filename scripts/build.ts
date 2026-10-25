import { rm } from "node:fs/promises"
import { relative, resolve } from "node:path"
import {
  cleanBuildOutputDir,
  writeAssets,
  writeRootConfig,
  writeWorkerConfig,
} from "@cloudflare/build-output-utils"
import config from "../cloudflare.config.ts"

const root = resolve(import.meta.dir, "..")
const dist = resolve(root, "dist")

await rm(dist, { recursive: true, force: true })
const build = await Bun.build({
  entrypoints: ["index", "privacy", "support"].map((page) => resolve(root, `src/${page}.html`)),
  outdir: dist,
  minify: true,
  external: ["*.woff2"],
})
if (!build.success) throw new AggregateError(build.logs, "Website build failed")

// Only versioned URLs receive immutable caching. HTML always checks for updates.
const immutablePaths = build.outputs
  .filter((output) => !output.path.endsWith(".html"))
  .map((output) => `/${relative(dist, output.path)}`)
for await (const name of new Bun.Glob("*.woff2").scan(resolve(root, "public/assets/fonts"))) {
  const path = `public/assets/fonts/${name}`
  await Bun.write(resolve(dist, path), Bun.file(resolve(root, path)))
  immutablePaths.push(`/${path}`)
}

// The bundler can't see the upright film's poster, which the script picks on
// phones, so it gets its versioned URL here.
const poster = Bun.file(resolve(root, "public/assets/video/promo-9x16-poster.webp"))
const hash = new Bun.CryptoHasher("sha256")
  .update(await poster.arrayBuffer())
  .digest("hex")
  .slice(0, 12)
const posterPath = `/assets/video/promo-9x16-poster-${hash}.webp`
await Bun.write(resolve(dist, posterPath.slice(1)), poster)
immutablePaths.push(posterPath)
const index = Bun.file(resolve(dist, "index.html"))
await Bun.write(
  index,
  (await index.text()).replaceAll("/assets/video/promo-9x16-poster.webp", posterPath),
)

// Link previews need a stable absolute URL, so the share image keeps its name.
await Bun.write(
  resolve(dist, "assets/images/og.jpg"),
  Bun.file(resolve(root, "public/assets/images/og.jpg")),
)

// The official extension repository, built with `chek ext build`. Components carry their version in their names, so they're
// immutable; the index is revalidated so servers see new versions.
for await (const name of new Bun.Glob("*").scan(resolve(root, "public/extensions"))) {
  await Bun.write(
    resolve(dist, "extensions", name),
    Bun.file(resolve(root, "public/extensions", name)),
  )
  if (name.endsWith(".wasm")) immutablePaths.push(`/extensions/${name}`)
}

// Conventional fallback favicon URL remains revalidated when the mark changes.
await Bun.write(
  resolve(dist, "favicon.ico"),
  Bun.file(resolve(root, "public/assets/logos/favicon.ico")),
)
await Bun.write(
  resolve(dist, "_headers"),
  immutablePaths
    .sort()
    .map((path) => `${path}\n  Cache-Control: public, max-age=31536000, immutable\n`)
    .join("\n"),
)

await cleanBuildOutputDir(root)
await writeRootConfig(root, { accountId: config.accountId }, { isPreview: false, mode: undefined })
await writeWorkerConfig({ root, config: config.worker })
await writeAssets({ root, sourceDirectory: dist })
