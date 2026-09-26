const DEFAULT_LOGO = '/assets/logo/default-logo.svg';
const JUSTIFY = { LEFT: 'justify-start', CENTER: 'justify-center', RIGHT: 'justify-end' };

/**
 * Shows the clinic logo in a box of the given width and height.
 * stretch: the image fills exactly that width x height (sizes set in Settings / templates);
 * otherwise it grows to the box keeping its proportions (sidebar, login page).
 * Falls back to the neutral default logo when none is uploaded.
 */
export default function LogoBox({ src, width, height, alt = 'Clinic logo', position = 'CENTER', stretch = false, className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center overflow-hidden ${JUSTIFY[position] || JUSTIFY.CENTER} ${className}`}
      style={{ width, height }}
    >
      <img
        src={src || DEFAULT_LOGO}
        alt={alt}
        className={`block h-full w-full ${stretch ? 'object-fill' : 'object-contain'}`}
      />
    </div>
  );
}
