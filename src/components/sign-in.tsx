import { signIn } from "@/server/auth"
import { redirect } from "next/dist/server/api-utils"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(undefined, {redirectTo: "/projects"})
      }}
    >
      <button type="submit">Signin</button>
    </form>
  )
} 