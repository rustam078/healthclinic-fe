import PrescriptionContent, { WEIGHT_BOX, rxArea } from './PrescriptionSheet';
import { inkToDataUrl } from './ink';

/** Printed prescription: the same sheet as the pad, with the doctor's ink as an image in the Rx area. */
export default function PrescriptionPrint({ template, appointment, strokes, weightStrokes, followUpDate }) {
  const { ratio } = rxArea(template);
  return (
    <PrescriptionContent
      template={template}
      appointment={appointment}
      followUpDate={followUpDate}
      weight={<img src={inkToDataUrl(weightStrokes, WEIGHT_BOX.height / WEIGHT_BOX.width, 400)} alt="Weight" className="absolute inset-0 h-full w-full" />}
      rx={<img src={inkToDataUrl(strokes, ratio)} alt="Prescription" className="absolute inset-0 h-full w-full" />}
    />
  );
}
