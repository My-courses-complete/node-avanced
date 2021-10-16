if (process.env.NODE_ENV !== 'production') require('longjohn')

setTimeout(() => {
  throw new Error('boom')
}, 2000)
