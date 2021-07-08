<script>
  import { onMount, createEventDispatcher } from 'svelte';

  const RADIUS = 40;
  const MID_X = 50;
  const MID_Y = 50;
  const MIN_RADIANS = (4 * Math.PI) / 3;
  const MAX_RADIANS = -Math.PI / 3;

  let pathValue;
  let knob;

  let length = 0;
  let animatedValue = 0;
  let interval = null;

  export let animation = {
    animated: true,
    animateValue: false,
    animationDuration: 2000,
    animationFunction: 'ease-in-out'
  };

  export let id;
  export let value = 0;
  export let max = 100;
  export let min = 0;
  export let showValue = true;

  export let disabled = false;
  export let step = 0.01;
  export let size = 50;
  export let responsive = false;
  export let primaryColor = '#6366F1';
  export let secondaryColor = '#A5B4FC';
  export let textColor = '#E844C3';
  export let strokeWidth = 5;
  export let valueDisplayFunction = (v) => v;

  const dispatch = createEventDispatcher();

  function emitValue(e) {
    dispatch('emitValue', {
      value,
      id
    });
  }

  onMount(async () => {
    dashLength();
    clearInterval(interval);

    interval = null;
    if (animation.animateValue) {
      interval = setInterval(() => {
        if (animatedValue < value) {
          animatedValue += 1;
        } else {
          clearInterval(interval);
          interval = null;
        }
      }, (animation.animationDuration * 1000) / value / 1000);
    }
  });

  $: dashStyle = {
    strokeDasharray: length,
    strokeDashoffset: length
  };

  $: style = 'height:' + (responsive ? size + '%' : size - 5 + 'px');

  $: computedSize = responsive ? size + '%' : size;

  $: rangePath = `M ${minX} ${minY} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX} ${maxY}`;

  $: valuePath = `M ${zeroX} ${zeroY} A ${RADIUS} ${RADIUS} 0 ${largeArc} ${sweep} ${valueX} ${valueY}`;

  $: zeroRadians =
    min > 0 && max > 0
      ? mapRange(min, min, max, MIN_RADIANS, MAX_RADIANS)
      : mapRange(0, min, max, MIN_RADIANS, MAX_RADIANS);

  $: valueRadians = mapRange(value, min, max, MIN_RADIANS, MAX_RADIANS);

  $: minX = MID_X + Math.cos(MIN_RADIANS) * RADIUS;

  $: minY = MID_Y - Math.sin(MIN_RADIANS) * RADIUS;

  $: maxX = MID_X + Math.cos(MAX_RADIANS) * RADIUS;

  $: maxY = MID_Y - Math.sin(MAX_RADIANS) * RADIUS;

  $: zeroX = MID_X + Math.cos(zeroRadians) * RADIUS;

  $: zeroY = MID_Y - Math.sin(zeroRadians) * RADIUS;

  $: valueX = MID_X + Math.cos(valueRadians) * RADIUS;

  $: valueY = MID_Y - Math.sin(valueRadians) * RADIUS;

  $: largeArc = Math.abs(zeroRadians - valueRadians) < Math.PI ? 0 : 1;

  $: sweep = valueRadians > zeroRadians ? 0 : 1;

  $: valueDisplay = animation.animateValue
    ? valueDisplayFunction(animatedValue)
    : valueDisplayFunction(value);

  function updatePosition(offsetX, offsetY) {
    const dx = offsetX - size / 2;
    const dy = size / 2 - offsetY;
    const angle = Math.atan2(dy, dx);

    let mappedValue;

    const start = -Math.PI / 2 - Math.PI / 6;

    if (angle > MAX_RADIANS) {
      mappedValue = mapRange(angle, MIN_RADIANS, MAX_RADIANS, min, max);
    } else if (angle < start) {
      mappedValue = mapRange(
        angle + 2 * Math.PI,
        MIN_RADIANS,
        MAX_RADIANS,
        min,
        max
      );
    } else {
      return;
    }

    value = Math.round((mappedValue - min) / step) * step + min;
  }

  function onClick(e) {
    if (!disabled) {
      updatePosition(e.offsetX, e.offsetY);
      emitValue(e);
    }
  }

  function onMouseDown(e) {
    if (!disabled) {
      e.preventDefault();
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }

  function onMouseUp(e) {
    if (!disabled) {
      e.preventDefault();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }

  function onTouchStart(e) {
    if (!disabled) {
      e.preventDefault();
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
  }

  function onTouchEnd(e) {
    if (!disabled) {
      e.preventDefault();
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
  }

  function onMouseMove(e) {
    if (!disabled) {
      e.preventDefault();
      updatePosition(e.offsetX, e.offsetY);
      emitValue(e);
    }
  }

  function onTouchMove(e) {
    if (!disabled && e.touches.length == 1) {
      const boundingClientRect = knob.getBoundingClientRect();
      const touch = e.targetTouches.item(0);
      const offsetX = touch.clientX - boundingClientRect.left;
      const offsetY = touch.clientY - boundingClientRect.top;
      updatePosition(offsetX, offsetY);
      emitValue(e);
    }
  }

  function dashLength() {
    let element = pathValue;
    let length = element.getTotalLength();
    if (animation.animated) {
      element.style.animationDuration =
        animation.animationDuration / 1000 + 's';
      element.style.animationFunction = animation.animationFunction;
    }
    element.dataset.dash = length;
    length = length;
  }

  function mapRange(x, inMin, inMax, outMin, outMax) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
</script>

<div class="knob-control" {style} bind:this={knob}>
  <svg
    width={computedSize}
    height={computedSize}
    viewBox="0 0 100 100"
    on:click={onClick}
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:touchstart={onTouchStart}
    on:touchend={onTouchEnd}
  >
    <path
      d={rangePath}
      stroke-width={strokeWidth}
      stroke={secondaryColor}
      class="knob-control__range"
    />

    {#if showValue}
      <path
        d={valuePath}
        stroke-width={strokeWidth}
        stroke={primaryColor}
        bind:this={pathValue}
        data-dash={length}
        style={dashStyle}
        class="knob-control__value"
      />
      <text
        x="50"
        y="57"
        text-anchor="middle"
        fill={textColor}
        class="knob-control__text-display"
      >
        {valueDisplay}
      </text>
    {/if}
  </svg>
</div>

<style>
  @keyframes dash-frame {
    100% {
      stroke-dashoffset: 0;
    }
  }

  .knob-control {
    cursor: pointer;
    margin-bottom: 0.1rem;
  }

  .knob-control__range {
    fill: none;
    transition: stroke 0.1s ease-in;
  }

  .knob-control__value {
    animation-name: dash-frame;
    animation-fill-mode: forwards;
    fill: none;
  }

  .knob-control__text-display {
    font-size: 1.4rem;
    text-align: center;
    font-weight: bold;
  }
</style>
