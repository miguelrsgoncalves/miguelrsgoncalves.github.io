var is_build = true

if (process.argv[2] === 'clear') {
  is_build = false
}

if (is_build) {
  build()
} else {
  return
}

function build() {
  return
}