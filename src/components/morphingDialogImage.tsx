import { XIcon } from 'lucide-react';
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from '../../components/motion-primitives/morphing-dialog';

export function MorphingDialogBasicImage({ image }: { image: any }) {
  return (
    <MorphingDialog
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <MorphingDialogTrigger>
        <MorphingDialogImage
          src={image}
          alt="Sony Style Store in the Sony Center complex - Berlin, Germany (2000)"
          className="max-w-[150px] rounded-[4px]"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative ">
          <MorphingDialogImage
            src={image}
            alt="Sony Style Store in the Sony Center complex - Berlin, Germany (2000)"
            className="h-auto w-full bg-black/20 max-w-[90vw] rounded-[4px] object-cover lg:h-[90vh]"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed right-6 top-6 h-fit w-fit rounded-full bg-black/20 p-1"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
