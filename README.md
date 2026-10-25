<p align="center">
  <img src="public/assets/logos/mark.svg" alt="Chek" width="80" height="80" />
</p>

<h1 align="center">chek.page</h1>

<p align="center">The landing page for <a href="https://github.com/readchek/chek">Chek</a>, live at <a href="https://chek.page">chek.page</a>.</p>

The page introduces the Chek app on the App Store with its real screens and
launch film.

## Development

Install [Bun](https://bun.sh), then run:

```sh
bun install
bun run dev
```

Open [localhost:18357](http://127.0.0.1:18357/). Set `PORT` to use another port.

```sh
bun run build
```

The static build is written to `dist/`.

Check code with `bun run lint`, `bun run format:check` and `bun run typecheck`. CI runs
them and the build on every pull request.

See the [website guide](docs/website.md) for deployment, asset maintenance,
font licenses, and provider logo sources, and the [design guide](docs/design.md)
for the visual direction.
