import React from 'react'
import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"
import CoursesTable from "./InstructorCourses/CoursesTable"

const MyCourses = () => {
  const {token} = useSelector((state)=> state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await fetchInstructorCourses(token)
      if(result) setCourses(result)
    }

    fetchCourses()
  }, [])
  

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 md:mb-14">
        <h1 className='text-2xl font-medium text-richblack-5 md:text-3xl'>My Courses</h1>
        <IconBtn text="Add Course" 
        onclick={() => navigate("/dashboard/add-course")}>
          <VscAdd/>
        </IconBtn>
      </div>
      {courses && <CoursesTable courses={courses} setCourses={setCourses}/>}
    </div>
  )
}

export default MyCourses