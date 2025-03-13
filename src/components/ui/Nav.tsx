"use client"
import React, { useEffect, useState } from 'react'

import { LabelInputContainer } from '../Student_details_form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { getSession } from 'next-auth/react'
import axios from 'axios'
import { useAppSelector } from '@/hooks/hooks'
import { Button } from './button'
import { useRouter } from 'next/navigation'
const Nav = () => {
  const {teacherid}=useAppSelector((state)=>state.user);
  const router=useRouter();
  const [div, setDiv] = useState<{ division_code: string; division_id: string }[]>([]);
  const [ismentor,setIsMentor]=useState(false);
  console.log(teacherid);
    let [profile, setProfile] = useState("https://res.cloudinary.com/durtlcmnb/image/upload/v1735891361/Healthcare_user_profile/ofvdziaspjfupznrdcdr.png");
      let [username,setUsername] = useState("");
      let [email,setEmail] = useState("");
      let [type,setType]=useState("");
      useEffect(() => {
        async function fetchData() {
            const session = await getSession();
            console.log(session); 
            if (session) {
              console.log(session.user.image);
              setProfile(session.user.image as string);
              setUsername(session.user.userName as string);
              setEmail(session.user.email as string);
              setType(session.user.usertype as string);
            }
          }
          if(teacherid){
          async function fetchdivision(){
            console.log(teacherid);
            const res=await axios.post("/api/fetch-division",teacherid);
            console.log(res.data.data);
            setDiv(res.data.data)
            if(res.data.message=="ismentor")
            {
              setIsMentor(true);
            }
          }
          fetchdivision();
        }
          fetchData();
        },[])
        console.log(div);
  return (
    <div className="flex flex-row-reverse items-center space-y-2 md:space-y-0 md:space-x-2 m-2 gap-3">
        <Logo profile={profile} username={username} email={email}/>

        {type=="TEACHER"?<div className="md:basis-1/4 flex flex-row-reverse items-center space-y-2 md:space-y-0 md:space-x-2 m-2 gap-3">
       
          <LabelInputContainer className="">
            {/* <Label htmlFor="division">Select Division For Show Data</Label> */}
            <Select name="division" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {div.map((divs)=>{
                  return <SelectItem value={divs.division_id} key={divs.division_id}>{divs.division_code}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </LabelInputContainer>
          {ismentor?<Button onClick={()=>router.replace("teacher-dashboard/divisions")}>Divisions</Button>:<></>}
        </div>
         
         :<></>
        }
      </div>
  )
}

export const Logo = ({ profile,username,email }: any) => {
    return (
      <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={profile} />
                <AvatarFallback>{username}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
    );
  };

export default Nav
