import React, { useState } from 'react'
import { useSelector } from "react-redux"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import convertSecondsToDuration from '../../../../utils/secToDurationFrontend'
import { formatDate } from "../../../../services/formatDate"
import { deleteCourse, fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"

const CoursesTable = ({ courses, setCourses }) => {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) setCourses(result)
    setConfirmationModal(null)
    setLoading(false)
  }

  function getDuration(course) {
    let totalDurationInSeconds = 0
    course.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        totalDurationInSeconds += parseInt(subSection.timeDuration)
      })
    })
    return convertSecondsToDuration(totalDurationInSeconds)
  }

  const StatusBadge = ({ status }) =>
    status === COURSE_STATUS.DRAFT ? (
      <p className="flex w-fit items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
        <HiClock size={14} /> Drafted
      </p>
    ) : (
      <p className="flex w-fit items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
          <FaCheck size={8} />
        </span>
        Published
      </p>
    )

  const ActionButtons = ({ course, iconSize = 20 }) => (
    <div className="flex items-center gap-1">
      <button
        disabled={loading}
        onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
        title="Edit"
        className="p-1 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
      >
        <FiEdit2 size={iconSize} />
      </button>
      <button
        disabled={loading}
        onClick={() =>
          setConfirmationModal({
            text1: "Do you want to delete this course?",
            text2: "All the data related to this course will be deleted",
            btn1Text: !loading ? "Delete" : "Loading...",
            btn2Text: "Cancel",
            btn1Handler: !loading ? () => handleCourseDelete(course._id) : () => {},
            btn2Handler: !loading ? () => setConfirmationModal(null) : () => {},
          })
        }
        title="Delete"
        className="p-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
      >
        <RiDeleteBin6Line size={iconSize} />
      </button>
    </div>
  )

  if (!courses?.length) {
    return (
      <div className="rounded-xl border border-richblack-800 py-10 text-center text-2xl font-medium text-richblack-100">
        No courses found
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE CARDS (< sm) ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:hidden">
        {courses.map((course) => (
          <div
            key={course._id}
            className="overflow-hidden rounded-xl border border-richblack-800 bg-richblack-900"
          >
            {/* Full-width thumbnail */}
            <img
              src={course?.thumbnail}
              alt={course?.courseName}
              className="w-full object-cover"
              style={{ maxHeight: '200px' }}
            />

            {/* Content below image */}
            <div className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold text-richblack-5">
                {course.courseName}
              </p>
              <p className="text-[12px] text-richblack-400">
                Created: {formatDate(course.createdAt)}
              </p>
              <StatusBadge status={course.status} />

              {/* Meta row */}
              <div className="flex items-center justify-between border-t border-richblack-700 pt-3 text-sm text-richblack-100">
                <div>
                  <span className="block text-xs text-richblack-400">Duration</span>
                  {getDuration(course)}
                </div>
                <div>
                  <span className="block text-xs text-richblack-400">Price</span>
                  ₹{course.price}
                </div>
                <div>
                  <span className="block text-xs text-richblack-400 mb-1">Actions</span>
                  <ActionButtons course={course} iconSize={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP TABLE (≥ sm) ────────────────────────────── */}
      <div className="hidden sm:block rounded-xl border border-richblack-800">
        {/* Header */}
        <div className="flex gap-x-10 rounded-t-xl border-b border-richblack-800 px-6 py-2">
          <p className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">Courses</p>
          <p className="text-left text-sm font-medium uppercase text-richblack-100">Duration</p>
          <p className="text-left text-sm font-medium uppercase text-richblack-100">Price</p>
          <p className="text-left text-sm font-medium uppercase text-richblack-100">Actions</p>
        </div>

        {/* Rows */}
        {courses.map((course) => (
          <div
            key={course._id}
            className="flex gap-x-10 border-b border-richblack-800 px-6 py-8 last:border-b-0"
          >
            {/* Course info */}
            <div className="flex flex-1 gap-x-4">
              <img
                src={course?.thumbnail}
                alt={course?.courseName}
                className="h-[148px] w-[220px] flex-shrink-0 rounded-lg object-cover"
              />
              <div className="flex flex-col justify-between gap-2">
                <p className="text-lg font-semibold text-richblack-5">{course.courseName}</p>
                <p className="text-xs text-richblack-300">
                  {course.description?.split(" ").length > TRUNCATE_LENGTH
                    ? course.description.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
                    : course.description}
                </p>
                <p className="text-[12px] text-white">Created: {formatDate(course.createdAt)}</p>
                <StatusBadge status={course.status} />
              </div>
            </div>

            <p className="text-sm font-medium text-richblack-100">{getDuration(course)}</p>
            <p className="text-sm font-medium text-richblack-100">₹{course.price}</p>
            <div className="text-sm font-medium text-richblack-100">
              <ActionButtons course={course} iconSize={20} />
            </div>
          </div>
        ))}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CoursesTable