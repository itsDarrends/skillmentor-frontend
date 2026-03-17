export default function ResourcesPage() {
  const resources = [
    { title: "AWS Certification Guide", description: "Complete guide to AWS Developer Associate certification exam preparation.", link: "https://aws.amazon.com/certification/", tag: "AWS" },
    { title: "Microsoft Azure Learning Path", description: "Official Microsoft learning paths for Azure certifications.", link: "https://learn.microsoft.com/en-us/training/azure/", tag: "Azure" },
    { title: "DevOps Roadmap", description: "A comprehensive roadmap for becoming a DevOps engineer.", link: "https://roadmap.sh/devops", tag: "DevOps" },
    { title: "AWS Free Tier", description: "Practice with real AWS services using the free tier account.", link: "https://aws.amazon.com/free/", tag: "AWS" },
    { title: "Spring Boot Documentation", description: "Official Spring Boot reference documentation and guides.", link: "https://docs.spring.io/spring-boot/", tag: "Backend" },
    { title: "React Documentation", description: "Official React documentation for building user interfaces.", link: "https://react.dev/", tag: "Frontend" },
    { title: "AWS Well-Architected Framework", description: "Learn best practices for designing and operating reliable cloud systems.", link: "https://aws.amazon.com/architecture/well-architected/", tag: "AWS" },
    { title: "Kubernetes Documentation", description: "Official Kubernetes documentation for container orchestration.", link: "https://kubernetes.io/docs/home/", tag: "DevOps" },
    { title: "TypeScript Handbook", description: "Official TypeScript handbook for learning typed JavaScript.", link: "https://www.typescriptlang.org/docs/", tag: "Frontend" },
  ];

  const tagColors: Record<string, string> = {
    AWS: "bg-yellow-100 text-yellow-800",
    Azure: "bg-blue-100 text-blue-800",
    DevOps: "bg-green-100 text-green-800",
    Backend: "bg-purple-100 text-purple-800",
    Frontend: "bg-pink-100 text-pink-800",
  };

  return (
    <div className="container py-16 max-w-5xl">
      <h1 className="text-5xl font-bold mb-4">Resources</h1>
      <p className="text-xl text-muted-foreground mb-12">
        Curated learning resources to help you prepare for certifications and advance your career.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <a key={resource.title} href={resource.link} target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow block">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${tagColors[resource.tag]}`}>
              {resource.tag}
            </span>
            <h3 className="font-semibold text-lg mt-3 mb-2">{resource.title}</h3>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}