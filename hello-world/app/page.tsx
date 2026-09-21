import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Home from './index'

type RosterMember = {
  id: number;
  name: string;
  email_prefix: string;
  email_domain: string;
};

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: roster } = await supabase.from('roster').select()
  console.log('roster', roster)

  return (
    <>
    <Home/>
    <table className="w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-700">
        <th className="border border-gray-300 px-4 py-2 text-left">
          Name
        </th>
        <th className="border border-gray-300 px-4 py-2 text-left">
          Email
        </th>
      </tr>
    </thead>
      
    <tbody>
      {roster?.map((member: RosterMember) => (
        <tr key={member.id}>
          <td className="border border-gray-300 px-4 py-2">
            {member.name}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {member.email_prefix}@{member.email_domain}
          </td>
        </tr>
      ))}
    </tbody>
    </table>
    </>
  )
}