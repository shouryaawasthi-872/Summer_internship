import { HiCheck, HiX, HiClock } from 'react-icons/hi';

const StepIcon = ({ status }) => {
  if (status === 'approved') return <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><HiCheck className="text-white text-sm" /></div>;
  if (status === 'rejected') return <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"><HiX className="text-white text-sm" /></div>;
  return <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><HiClock className="text-gray-400 text-sm" /></div>;
};

export default function ApprovalPipeline({ application }) {
  const steps = [
    { label: 'Mentor Review',     data: application?.mentorApproval },
    { label: 'Admin Review',      data: application?.adminApproval },
    { label: 'Super Admin Review',data: application?.superAdminApproval },
  ];

  return (
    <div className="card p-5">
      <h4 className="font-semibold text-gray-900 mb-4">Approval Pipeline</h4>
      <div className="flex items-start gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <StepIcon status={step.data?.status || 'pending'} />
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${step.data?.status === 'approved' ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="text-center mt-2 px-1">
              <p className="text-xs font-medium text-gray-700">{step.label}</p>
              <p className={`text-xs capitalize mt-0.5 ${
                step.data?.status === 'approved' ? 'text-green-600' :
                step.data?.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
              }`}>{step.data?.status || 'pending'}</p>
              {step.data?.comment && <p className="text-xs text-gray-400 mt-0.5 italic">"{step.data.comment}"</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
