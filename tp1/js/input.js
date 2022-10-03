export default function (bindings) {
  document.addEventListener('keydown',  e => keyDownEvent(e, bindings));
  document.addEventListener('keyup',    e => keyUpEvent(e, bindings));
}

function keyDownEvent(e, bindings) {
  const binding = bindings[e.code];
  if(!e.repeat && binding) {
    binding.down();
  }
}

function keyUpEvent(e, bindings) {
  const binding = bindings[e.code];
  if(!e.repeat && binding) {
    binding.up();
  }
}
