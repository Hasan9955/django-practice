"use client";

import { signIn, useSession } from "next-auth/react";
// import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

const LoginWithGoogle = () => {
  const { data: session } = useSession();
  console.log(session);
  return (
		<div>
			{/* {session ? (
        <div>
          <p>Name: {session?.user?.name}</p>
          <p>Email: {session?.user?.email}</p>
          <p>Image:</p>{" "}
          <Image
            src={
              session?.user?.image ||
              "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/10/untitled-design-2024-10-01t123706-515-1.jpg"
            }
            alt="image"
            height={200}
            width={200}
          />
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="relative w-full bg-blue-primary text-white py-2 px-4 rounded-md hover:bg-[#4285F4]/90 flex items-center justify-center"
        >
          <div className="absolute top-[3px] left-[3px] bg-white rounded-sm p-1">
            <FcGoogle size={24} />
          </div>
          Sign up with Google
        </button>
      )} */}

			<button
				onClick={() => signIn("GOOGLE")}
				className=" w-full py-2 px-4 rounded-md text-black border flex items-center justify-center gap-2"
			>
				<FcGoogle size={24} />
			</button>

			{/* <div>
        {session && <button onClick={() => signOut()}>Logout</button>}
        {!session && <p>You are not logged in</p>}
      </div> */}
		</div>
	);
};

export default LoginWithGoogle;
