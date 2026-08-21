(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const namespaceSvg = (source, namespace) => {
    const ids = [...source.matchAll(/\bid=(['"])([^'"]+)\1/g)].map((match) => match[2]);
    let output = source;

    ids.forEach((id) => {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const next = `${namespace}-${id}`;
      output = output
        .replace(new RegExp(`id=(['"])${escaped}\\1`, 'g'), `id="${next}"`)
        .replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${next})`)
        .replace(new RegExp(`(href|xlink:href)=(['"])#${escaped}\\2`, 'g'), `$1="#${next}"`);
    });

    output = output.replace(/aria-labelledby=(['"])([^'"]+)\1/g, (_, quote, value) => {
      const namespaced = value
        .split(/\s+/)
        .map((id) => `${namespace}-${id}`)
        .join(' ');
      return `aria-labelledby=${quote}${namespaced}${quote}`;
    });

    return output;
  };

  document.querySelectorAll('.suaveforge-logo-motion').forEach(async (root, index) => {
    const shell = root.querySelector('.logo-shell') || root;
    const svgSrc = root.dataset.svgSrc;
    const namespace = `sf-logo-${index + 1}`;

    try {
      if (svgSrc && !root.querySelector('.motion-logo')) {
        const response = await fetch(svgSrc);
        if (!response.ok) throw new Error(`Logo request failed: ${response.status}`);
        shell.innerHTML = namespaceSvg(await response.text(), namespace);
      }

      root.querySelectorAll('[id$="-motionLayers"], [id$="-originalLogo"]').forEach((node) => {
        node.style.display = 'none';
      });
      const finalLogo = root.querySelector('[id$="-exactFinalLogo"]');
      if (finalLogo) {
        finalLogo.style.opacity = '1';
        finalLogo.style.display = 'block';
      }
      root.classList.add('logo-ready');

      if (!reduceMotion && root.hasAttribute('data-logo-motion')) {
        shell.animate([
          { transform: 'scale(.93) rotate(-4deg)', opacity: .25 },
          { transform: 'scale(1.035) rotate(1.5deg)', opacity: 1, offset: .72 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: 780, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
      }
    } catch (error) {
      root.classList.add('logo-fallback');
      console.warn('SuaveForge logo fallback:', error);
    }
  });
})();
