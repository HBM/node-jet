//https://github.com/elijahmanor/cross-var
const spawn = require('cross-spawn')
const exec = require('child_process').exec
const exit = require('exit')

const normalize = (args) => {
  return args.map((arg) => {
    Object.keys(process.env)
      .sort((x, y) => x.length - y.length)
      .forEach((key) => {
        const regex = new RegExp(`\\$${key}|%${key}%`, 'ig')
        arg = arg.replace(regex, process.env[key])
      })
    return arg
  })
}

let args = process.argv.slice(2)
if (args.length === 1) {
  const [command] = normalize(args)
  const proc = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    process.stdout.write(stdout)
    process.stderr.write(stderr)
    exit(proc.exitCode)
  })
} else {
  args = normalize(args)
  const command = args.shift()
  const proc = spawn.sync(command, args, { stdio: 'inherit' })
  exit(proc.status)
}
