const DEFAULT_LOGO = '/assets/logo/default-logo.svg';
const JUSTIFY = { LEFT: 'justify-start', CENTER: 'justify-center', RIGHT: 'justify-end' };

/**
 * Shows the clinic logo inside a fixed box without distortion or cropping:
 * the image scales proportionally (object-fit: contain) to the box's max width/height.
 * Falls back to the neutral default logo when none is uploaded.
 */
export default function LogoBox({ src, width, height, alt = 'Clinic logo', position = 'CENTER', className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center overflow-hidden ${JUSTIFY[position] || JUSTIFY.CENTER} ${className}`}
      style={{ width, height }}
    >
      <img
        src={src || DEFAULT_LOGO}
        alt={alt}
        className="block h-auto w-auto object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
