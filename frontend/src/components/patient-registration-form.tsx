import { CheckCircle2, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppStore } from '../store/useAppStore'
import { Badge, Button, Input, Select, Textarea } from './ui'

const registrationSchema = z.object({
  name: z.string().min(2, 'Patient name is required'),
  age: z.coerce.number().min(0).max(130),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(7),
  department: z.string().min(2, 'Select a department'),
  doctor: z.string().min(2, 'Select a doctor'),
  symptoms: z.string().max(500).optional().or(z.literal('')),
  priority: z.enum(['Normal', 'Senior Citizen', 'Emergency']),
  emergency: z.boolean().optional(),
  senior_citizen: z.boolean().optional(),
})

export type RegistrationValues = z.infer<typeof registrationSchema>

export function PatientRegistrationForm({
  submitLabel = 'Generate token automatically',
  onSuccess,
}: {
  submitLabel?: string
  onSuccess?: () => void
}) {
  const departments = useAppStore(state => state.departments)
  const doctors = useAppStore(state => state.doctors)
  const registerPatient = useAppStore(state => state.registerPatient)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, watch, reset, setValue, getValues, formState: { isSubmitting } } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      priority: 'Normal',
      emergency: false,
      senior_citizen: false,
      gender: 'Male',
    },
  })

  const selectedDepartment = watch('department')
  const filteredDoctors = useMemo(() => {
    if (!selectedDepartment) return doctors
    const department = departments.find(item => item.name === selectedDepartment)
    if (!department) return doctors
    return doctors.filter(item => item.department_id === department.id)
  }, [departments, doctors, selectedDepartment])

  useEffect(() => {
    if (!selectedDepartment || filteredDoctors.length === 0) return
    const currentDoctor = getValues('doctor')
    if (!currentDoctor || !filteredDoctors.some(item => item.name === currentDoctor)) {
      setValue('doctor', filteredDoctors[0].name)
    }
  }, [filteredDoctors, getValues, selectedDepartment, setValue])

  return (
    <div className="relative">
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async values => {
          await registerPatient({ ...values, consultation_minutes: null })
          reset({ priority: 'Normal', emergency: false, senior_citizen: false, gender: 'Male' })
          setSubmitted(true)
          window.setTimeout(() => {
            setSubmitted(false)
            onSuccess?.()
          }, 1700)
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Patient Name
            <Input placeholder="Enter patient name" {...register('name')} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Age
            <Input type="number" placeholder="Age" {...register('age')} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Gender
            <Select {...register('gender')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Phone
            <Input placeholder="Mobile number" {...register('phone')} />
          </label>
          <label className="space-y-2 text-sm font-medium md:col-span-2">
            Department
            <Select {...register('department')}>
              <option value="">Select department</option>
              {departments.map(department => <option key={department.id} value={department.name}>{department.name}</option>)}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium md:col-span-2">
            Doctor
            <Select {...register('doctor')}>
              <option value="">Select doctor</option>
              {filteredDoctors.map(doctor => <option key={doctor.id} value={doctor.name}>{doctor.name}</option>)}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium md:col-span-2">
            Symptoms
            <Textarea rows={4} placeholder="Brief complaint or symptoms" {...register('symptoms')} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            Priority
            <Select {...register('priority')}>
              <option value="Normal">Normal</option>
              <option value="Senior Citizen">Senior Citizen</option>
              <option value="Emergency">Emergency</option>
            </Select>
          </label>
          <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 px-4 py-3 text-sm font-medium dark:border-white/10">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" {...register('emergency')} /> Emergency
          </label>
          <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 px-4 py-3 text-sm font-medium dark:border-white/10">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" {...register('senior_citizen')} /> Senior citizen
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-dashed border-primary/20 bg-primary/5 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Priority-aware flow</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Emergency patients are elevated first, then senior citizens, then normal FIFO tokens.</p>
          </div>
          <Badge className="border-primary/20 bg-white text-primary dark:bg-white/5">Live sync ready</Badge>
        </div>

        <Button type="submit" className="w-full py-4 text-base" disabled={isSubmitting}>
          <Sparkles className="h-4 w-4" /> {submitLabel}
        </Button>
      </form>

      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/80 backdrop-blur-sm dark:bg-slate-950/80"
          >
            <div className="rounded-[28px] border border-white/60 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-slate-950">
              <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
              <h3 className="mt-4 text-3xl font-black text-ink dark:text-white">Patient registered</h3>
              <p className="mt-2 text-sm text-slate-500">The queue updated live across reception, mobile, and TV screens.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}