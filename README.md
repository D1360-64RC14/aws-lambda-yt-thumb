# aws-lambda-yt-thumb

Este projeto permite que você crie uma AWS Lambda function que com a capacidade
de lhe disponibilizar a URL da imagem da thumbnail de qualquer vídeo do YouTube
em alta qualidade, dado o link para o mesmo.

## Formatos de Link Suportados

- Vídeo: `https://www.youtube.com/watch?v=xxxxxxxxx`
- Share: `https://youtu.be/xxxxxxxxx`
- Shorts: `https://www.youtube.com/shorts/xxxxxxxxx`

## Utilizando o Projeto

Com uma Lambda function configurada rodando NodeJS, envie o `zip`
`getYouTubeThumbnail.zip` -- ou os arquivos `index.mjs` e `LambdaError.mjs` --
para a Lambda function e acesse a API URL da Lambda passando como query argument
`url` a URL do vídeo do YouTube compatível com alguns dos [formatos suportados](#formatos-de-link-suportados)
para obter a URL para a thumbnail do vídeo em alta resolução.

> [!warning]
> Importante frisar que a URL precisa estar codificada em URL Encoding ([Percent-encoding](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding))
> para funcionar na AWS. Alguns clientes HTTP [já fazem esta codificação](https://reqbin.com/),
> mas em outros, como Postman, é necessário [codificar manualmente](https://stackoverflow.com/a/58352537).
>
> Caso tal problema ocorra, será retornado uma resposta automática `400 Bad Request`
> com o corpo `{"message":null}` da AWS.

Exemplo de requisição usando curl (Linux):

```sh
AWS_LAMBDA_URL='https://abcdefghijklmnopqrstuvwxyzabcdef.lambda-url.region.on.aws'
curl "$AWS_LAMBDA_URL/?url=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ"
```

Exemplo de requisição usando JavaScript (NodeJS):

```js
const awsLambdaUrl = "https://abcdefghijklmnopqrstuvwxyzabcdef.lambda-url.region.on.aws";
const videoUrl = "https://youtu.be/dQw4w9WgXcQ";

const url = new URL(awsLambdaUrl);
url.searchParams.set("url", videoUrl);

fetch(awsLambdaUrl)
  .then(async (res) => console.log(await res.json()));
```

Resposta esperada:

```jsonc
{
  "id" : "dQw4w9WgXcQ", // ID do vídeo
  "type" : "share", // Tipo de link ("video", "shorts", "share")
  "url" : "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" // URL da thumbnail
}
```

### Erros

Durante a execução pode ocorrer os seguintes tipos de erro:

#### 400 - Required URL parameter is missing

```json
{
  "error": "Required URL parameter is missing",
  "data": {
    "param": "url"
  }
}
```

#### 400 - Malformed URL

```json
{
  "error": "Malformed URL",
  "data": {
    "url": "<URL em formato inválido>"
  }
}
```

#### 400 - Unsupported YouTube URL

```json
{
  "error": "Unsupported YouTube URL",
  "data": {
    "url": "https://tutube.com/dQw4w9WgXcQ"
  }
}
```

---

Projeto desenvolvido para aula de Arquitetura Cloud sobre AWS Lambda.
