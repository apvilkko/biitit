const cache = {}
const doRequest = (url) => fetch(url).then((response) => response.arrayBuffer())

const SAMPLES_PATH = '/shared/samples/{style}/{name}{index}.ogg'

export default (ctx, spec) => {
  const cacheKey = `${spec.style}-${spec.name}-${spec.index}`
  return new Promise((resolve) => {
    if (cache[cacheKey]) {
      resolve(cache[cacheKey])
      return
    }
    const url = SAMPLES_PATH.replace('{style}', spec.style)
      .replace('{name}', spec.name)
      .replace('{index}', spec.index)
      .toLowerCase()
    doRequest(url).then((rawBuffer) => {
      ctx.decodeAudioData(
        rawBuffer,
        (buffer) => {
          cache[cacheKey] = buffer
          resolve(buffer)
        },
        (err) => console.log(err)
      )
    })
  })
}
