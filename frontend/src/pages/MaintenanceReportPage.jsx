import { useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import MaintenanceReportForm from '../components/MaintenanceReportForm';

  const MaintenanceReportPage = () => {
    const { user } = useContext(AuthContext);

    console.log('MaintenanceReportPage: Component mounted');
    console.log('MaintenanceReportPage: User:', JSON.stringify(user, null, 2));
    console.log('MaintenanceReportPage: Rendering MaintenanceReportForm:', !!MaintenanceReportForm);

    if (!user) {
      console.log('MaintenanceReportPage: No user, redirecting to login');
      return <div className="text-white text-center mt-8">Please log in to report maintenance issues.</div>;
    }

    if (user.role !== 'student' && user.role !== 'lecturer') {
      console.log('MaintenanceReportPage: Unauthorized role:', user.role);
      return <div className="text-white text-center mt-8">Access denied. Students and lecturers only.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Report Maintenance Issue</h1>
        <div className="max-w-2xl mx-auto">
          <MaintenanceReportForm />
        </div>
      </div>
    );
  };

  export default MaintenanceReportPage;