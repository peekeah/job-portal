import { Applicants, ApplicantType } from "@/app/(dashboard)/dashboard/job/[jobId]/page";
import axios from "axios";

import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ApplicantTableProps = {
  jobId: string;
  applicants: Applicants[];
  type: ApplicantType;
  refetch: () => void
}

const ApplicantsTable = ({ applicants, jobId, type, refetch }: ApplicantTableProps) => {

  const onActionSubmit = async (jobId: string, applicantId: string, applicantStatus: string) => {
    try {
      const payload = { jobId, studentId: applicantId, applicantStatus };

      const res = await axios.post("/api/jobs/select-candidate", payload)
      if (!res?.data?.status) {
        throw new Error(res?.data?.error || "Error while saving")
      }
      alert("successfully saved")
      refetch()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    applicants?.length ?
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            {
              type !== "hired" ? <TableHead>Action</TableHead> : null
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            applicants.map((el, index) => {
              return (
                <TableRow
                  className="cursor-pointer transition-all"
                  key={el.id || index}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{el.applicant?.name}</TableCell>
                  <TableCell>{el.applicant?.email}</TableCell>
                  <TableCell>{el.applicant?.mobile}</TableCell>
                  {
                    type !== "hired" ?
                      <TableCell className="space-x-3">
                        {
                          type === "applied" ?
                            <Button onClick={() => onActionSubmit(jobId, el.applicant.id, "shortlisted")}>Shortlist</Button> :
                            <Button onClick={() => onActionSubmit(jobId, el.applicant.id, "hired")}>Hire</Button>
                        }
                      </TableCell> : null
                  }
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table> : <div className="h-42 w-full bg-neutral-50 grid place-content-center">
        <span className="text-xl">No applicant found</span>
      </div>
  )
}

export default ApplicantsTable
