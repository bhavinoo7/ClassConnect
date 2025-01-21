"use client"
import React, { useEffect, useState } from 'react'

import { LabelInputContainer } from '../Student_details_form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { getSession } from 'next-auth/react'
import { emit } from 'process'
import { userActions } from '@/store/slice/user'
import { useDispatch } from 'react-redux'

const Nav = () => {
  const dispatch = useDispatch();
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
              dispatch(userActions.login({email:session.user.email}));
            }
          }
          fetchData();
        },[])
  return (
    <div className="flex flex-row-reverse items-center space-y-2 md:space-y-0 md:space-x-2 m-2 gap-3">
        <Logo profile={profile} username={username} email={email}/>

        {type=="TEACHER"?<div className="md:basis-1/4">
          <LabelInputContainer className="">
            {/* <Label htmlFor="division">Select Division For Show Data</Label> */}
            <Select name="division" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </LabelInputContainer>
        </div>:<></>}
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
