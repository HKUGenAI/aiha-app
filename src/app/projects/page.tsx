import { auth } from "@/server/auth";
import { getMyProjects, getPublicProjects } from "@/server/actions/projects";
import { IProject } from "@/server/models/project";
import Link from "next/link";

export default async function ProjectPage() {
    const session = await auth();
    
    // Only fetch public projects if not logged in
    const publicProjects = await getPublicProjects();
    const myProjects = session?.user?.id ? await getMyProjects(session.user.id) : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                {session && (
                    <Link
                        href="/projects/new"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Create Project
                    </Link>
                )}
            </div>
        
            {/* My Projects Section */}
            <section id="my-projects" className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
                {!session ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                        <p className="text-gray-600 mb-4">Sign in to see your projects</p>
                        <Link 
                            href="/api/auth/signin"
                            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : !myProjects || myProjects?.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <p className="text-gray-500">You haven't created any projects yet.</p>
                        <Link 
                            href="/projects/new"
                            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
                        >
                            Create your first project →
                        </Link>
                    </div>
                ) : (
                    // <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    //     {myProjects?.map((project) => (
                    //         <div
                    //             key={project._id.toString()}
                    //             className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    //         >
                    //             <h3 className="text-lg font-medium text-gray-900">
                    //                 <Link href={`/projects/${project._id}`}>
                    //                     {project.projectName}
                    //                 </Link>
                    //             </h3>
                    //             <p className="mt-2 text-sm text-gray-500">
                    //                 {project.description}
                    //             </p>
                    //             <div className="mt-4 flex items-center justify-between">
                    //                 <span className="text-xs text-gray-500">
                    //                     Updated {new Date(project.updatedAt).toLocaleDateString()}
                    //                 </span>
                    //                 {project.isPublic && (
                    //                     <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    //                         Public
                    //                     </span>
                    //                 )}
                    //             </div>
                    //         </div>
                    //     ))}
                    // </div>
                    <ProjectList projects={myProjects} />
                )}
            </section>

            {/* Public Projects Section */}
            <section id="public-projects" className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Public Projects</h2>
                {publicProjects.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <p className="text-gray-500">No public projects available.</p>
                    </div>
                ) : (
                    // <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    //     {publicProjects.map((project) => (
                    //         <div
                    //             key={project._id.toString()}
                    //             className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    //         >
                    //             <h3 className="text-lg font-medium text-gray-900">
                    //                 <Link href={`/projects/${project._id}`}>
                    //                     {project.projectName}
                    //                 </Link>
                    //             </h3>
                    //             <p className="mt-2 text-sm text-gray-500">
                    //                 {project.description}
                    //             </p>
                    //             <div className="mt-4 flex items-center justify-between">
                    //                 <span className="text-xs text-gray-500">
                    //                     By {project.ownerName || 'Anonymous'}
                    //                 </span>
                    //                 <span className="text-xs text-gray-500">
                    //                     Updated {new Date(project.updatedAt).toLocaleDateString()}
                    //                 </span>
                    //             </div>
                    //         </div>
                    //     ))}
                    // </div>
                    <ProjectList projects={publicProjects} showOwner={true} />
                )}
            </section>
        </div>
    );
}

function ProjectList({ projects, showOwner = false }: {
    projects: IProject[];
    showOwner?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <div
                    key={project._id.toString()}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900">
                        <Link href={`/projects/${project._id}`}>
                            {project.projectName}
                        </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {project.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        {showOwner ? (
                            <span className="text-xs text-gray-500">
                                By {project.ownerName || 'Anonymous'}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500">
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                        {!showOwner && project.isPublic && (
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Public
                            </span>
                        )}
                        {showOwner && (
                            <span className="text-xs text-gray-500">
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}


