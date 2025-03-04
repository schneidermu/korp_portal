import React from "react";

import { Avatar as ChakraAvatar, Image } from "@chakra-ui/react";

import { Link } from "react-router-dom";

import { User } from "@/features/user/types";
import { resolveMediaPath } from "@/shared/utils";

import personIcon from "@/assets/person.svg";

// export const Avatar = ({
//   user,
//   updateUser,
//   editing,
// }: {
//   user: User;
//   updateUser: UpdateUserFn;
//   editing: boolean;
// }) => {
//   return (
//     <Link
//       to={`/profile/${user.id}`}
//       className="shrink-0 rounded-photo overflow-hidden relative"
//     >
//       <Picture width="260px" height="100%" url={userPhotoPath(user)} />
//       {editing && (
//         <div className="w-full absolute bottom-0 text-[16px] bg-[#D9D9D9C0]">
//           <label
//             className="block w-full py-3 hover:underline text-center cursor-pointer select-none"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <FileInput
//               accept={ACCEPT_IMAGES}
//               onUpload={(url) => updateUser({ ...user, photo: url })}
//             />
//             Загрузить фото
//           </label>
//           <hr className="text-[#cecece]" />
//           <button
//             onClick={(event) => {
//               event.stopPropagation();
//               updateUser({ ...user, photo: null });
//             }}
//             className="w-full py-3 hover:underline select-none"
//             type="button"
//           >
//             Удалить фото
//           </button>
//         </div>
//       )}
//     </Link>
//   );
// };

export interface AvatarProps extends ChakraAvatar.RootProps {
  user: User;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const { user, ...rest } = props;

    const src = user.photo ? resolveMediaPath(user.photo) : undefined;

    return (
      <ChakraAvatar.Root asChild ref={ref} {...rest}>
        <Link to={`/profile/${user.id}`}>
          <ChakraAvatar.Image src={src} w="full" h="full" />
          <ChakraAvatar.Fallback w="full" h="full">
            <Image src={personIcon} w="full" h="full" />
          </ChakraAvatar.Fallback>
        </Link>
      </ChakraAvatar.Root>
    );
  },
);
