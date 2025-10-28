// Text in this file is used to populate the kalamApp text pairs and project data.
export const kalamAppTextPairs = [
    { title: "Software Engineer", subtitle: "C <span style=\"font-size:0.5em; vertical-align:middle;\">✿</span> Python <span style=\"font-size:0.5em; vertical-align:middle;\">✿</span> Flutter <span style=\"font-size:0.5em; vertical-align:middle;\">✿</span> PHP <span style=\"font-size:0.5em; vertical-align:middle;\">✿</span> Java" },
    { title: "E2E Project Owner", subtitle: "Shipped full-stack apps from scratch to release" },
    { title: "Proven Track Record", subtitle: "Delivered production grade solutions at Blueberry Consultants" },
    { title: "Computer Science Student", subtitle: "on track for a First Class Honours at Aston University" },
    { title: "Machine Learning Engineer", subtitle: "Delivered AI and Machine Learning applications" },
    { title: "Open Source Contributor", subtitle: "Actively work with open source projects" },
    { title: "CI/CD Automator", subtitle: "Implemented CICD pipelines with GitHub Actions and GitLab CICD" },
    { title: "Linux Systems Builder", subtitle: "Configured secure VPSs for custom services" },
    { title: "Community Founder", subtitle: "Runs a community of almost 200 people" },
    { title: "Grounded in Data", subtitle: "Background in Physics and Mathematics (A-Levels)" },
];

// Data for the projects displayed in the project app
export const projectsData = [
    {
        id: "projectLaryngoscope",
        name: "AI-Powered Laryngoscope Application",
        shortDescription: "On-device Throat Disease Detection",
        icon: "images/projects/laryngoscope/laryngoscope-icon.webp",
        liveLink: null,
        sourceLink: null,
        bannerImage: "",
        bannerVideo: "images/projects/laryngoscope/laryngoscope-banner.mp4",
        bannerPoster: "images/projects/laryngoscope/laryngoscope-poster.webp",
        tags: [
            "Android", "Flutter", "Dart", "TensorFlow", "YOLO", "Edge AI", "Computer Vision",
            "UVC Camera", "Model Quantisation", "Realtime Inference"
        ],

        tldr: `
            <ul>
                <li>Developed an application for throat disease detection using ML.</li>
                <li>Curated and annotated a dataset of 3018 throat images.</li>
                <li>Trained a YOLOv11 model with 15,000 augmented images.</li>
                <li>Integrated UVC camera feed for processing</li>
                <li>Implemented on-device inference with quantised TF Lite model</li>
                <li>Delivered a proof-of-concept app that detects throat abnormalities in real-time</li>
                <li>Successfully won contract for further development with the client</li>
            </ul>
        `,

        details: `
            <h3>Project Overview</h3>
            <p>
                I had worked as the lead developer on a project to create a laryngoscope app for Android that uses
                UVC cameras to see down a patient's throat. This project was well received by the client, and a new 
                innovative feature was requested: real-time detection of throat abnormalities using machine learning.
                The goal was to develop a mobile application that could flag cancerous tissue in real time, on device,
                reducing costs and potentially saving lives by enabling early detection.
            </p>

            <h3>Dataset Curation and Annotation</h3>
            <p>
                The first step was to curate a dataset of throat images, and at this stage of the project, we weren't able to
                collect live data from patients. Instead, my manager and the clients found datasets from various sources across
                the web, including medical journals and open datasets.
            </p>
            <p>
                Object detection requires a very specific type of data to train on, and the data I trained the model on 
                had to somewhat resemble the data being passed into the model during inference. This ruled out most publicly
                available dataset, as they were either too zoomed in, or used Narrow Band Imaging (in contrast to the UVC camera's
                white light) to take the photo. Object detection also requires bounding boxes to be labelled per image for the model
                to accurately learn which parts of an image cause a specific class to be in view.
            </p>
            <p>
                Of the datasets that we found, the one that I found best fit our usecase was 
                <strong><a href="https://www.sciencedirect.com/science/article/abs/pii/S0167865521002646?via%3Dihub">laryngoscope8</a></strong>,
                a dataset of 3018 images taken of various consenting patients in China. The data was split into 8 different categories, crucially
                including a "Normal" category that would allow us to eliminate false positives. A normal category was missing
                from the other datasets I looked at. There was some flaws with this set however, for example, certain categories, like
                "Glottic Cancer" had a very small number of images (28 in the case of Glottic Cancer). This meant the accuracy for
                these classes were much lower. Furthermore, there was no bounding box information which meant each had to be manually marked up
            </p>
            <p>
                Labelling the data was initially done using Label Studio as it's free, open source and has a good standing in the AI ML world.
                However, we quickly ran into problems with Label Studio as it's primarly designed to be a web app hosted on a service; running 
                it locally gave us numerous bugs.
            </p>
            <p>
                Switching to Roboflow's environment was much better as it felt like a more mature system and uploading to their servers was
                actually faster compared to "uplaoding" to the local Label Studio server hosted on device (albeit this was done on different
                devices.)
                Another benefit to using Roboflow for this task is being able to delegate labelling to other users in your team, which
                meant the full 3018 can be completed by other users. 
            </p>
            <p>
                Labelling the data was as simple as going through each folder uploaded, identifying visually the affected tissue and then
                using the box tool to draw a bounding box as tight as possible. Of course, as I am not a medical expert, there is a known
                limit here to how accurate it is, but as a proof of concept this is perfectly acceptable. Ideally, the client would hire an
                expert in this field to go through the dataset and mark the data themselves, and this is planned to take place at a later
                stage.
            </p>

            <h3>Model Training and Optimisation</h3>
            <p> 
                The first step to model training is to prepare the data. Roboflow provides tools to <strong>augment</strong> the data; applying modifications
                to the original set of images in order to create more data to train from. This included translating the image, rotating the image,
                blurring the image, lowering and increasing brightness. As the original set of throat images were uniform, unless the camera
                was in the exact same orientation each and every time, finding matches would be difficult. Furthermore, the rotations and
                translations simulate the moving of the camera within the throat. Augmenting the 3018 dataset provided a grand total of ~15000 
                images to train the model on, a much more complete set.
            </p>
            <p>
                I chose to use the YOLOv11 object detection model and split the dataset. 60% of the data is used for training, 25% of the
                data used for validation and then post-training, 10% is used to validate the accuracy of the model. Again, Roboflow provides
                a simple interface to get this going and once the dataset was split, training was commenced.
            </p>
            <p>
                The model took 10 hours to train, and were subsequently exported as a YOLO weights file ("weights.pt"). To improve performance
                on the mobile devices, the weights file was <strong>quantized to int8</strong> format, which reduces the size of the model and
                improves inference speed at the cost of some accuracy. This is a common practice in mobile ML applications, and also allows the
                NPU of the device to be used for inference, which is much faster than using the CPU.
            </p>


            <h3>Camera Feed Integration</h3>
            <p>
                The flutter_uvc_camera plugin we used was not complete and had the functionality to grab the frame directly from the UVC 
                camera feed did not work. These gaps were maddening as they looked like they were implemented, since the API references
                were there, but it turns out, it was not implemented in the Kotlin code. Eventually, I modified the plugin to a state where
                <italic>some</italic> sort of frame was captured, but this was in H264 format, incompatible with what we needed (a simple image.)
                With further investigation and modification to the codebase, admittedly with assitance from an LLM, I was able to navigate the
                Chinese commented code and figure a solution to instead output the native YUYV format - a common format for UVC cameras.
                The TensorFlow Lite model required RGB frames, so I then implemented a conversion from YUYV to RGB in the Flutter app. Finally,
                the RGB frame was converted to a UInt8 format, which is the format the model expects.
            </p>

            <h3>Tensors and Inference</h3>
            <p>
                Using the <strong><a href="netron.app">Netron</a></strong> tool, I was able to inspect the model and determine the shape of
                the input tensor as well as the output tensor. A tensor is a multi-dimensional array, and in this case, the input tensor
                is a 4D array with the shape [1, 640, 640, 3], where 1 is the batch size, 640 is the height and width of the image and 3 represents
                the RGB channels. The output tensor is a 3D array with the shape [1, 11, 8400], where 11 is the number of classes (including the background class)
                and 8400 is the number of bounding boxes predicted by the model. Inference is done by passing the input tensor to the model
                and getting the output tensor back. The output tensor contains the bounding boxes, confidence scores and class IDs for each detected object.
            </p>

            <h3>Outcome</h3>
            <p>
                The final application was able to run the model on the device in real time, detecting throat abnormalities with a high degree of accuracy,
                with consideration to the fact that the model was trained on a limited dataset. The app was able to display bounding boxes around the detected
                abnormalities in almost real-time, with some latency on a high end Samsung Galaxy S25, but this can be optimised further with more efficient
                code and further model optimisation.
            </p>
            <p>
                The client was very impressed with the results and has since contracted the company to further develop the application as well as
                add more features to the app.
            </p>
            <p>
                This project has been a great learning experience for me, as it has allowed me to work with real-time object detection on mobile devices,
                and importantly, has bolstered my enthusiasm for AI and ML applications in general.
            </p>
        `
        },
    {
        id: "projectSnapStream",
        name: "SnapStream",
        shortDescription: "Offline QR Code Data-Transfer Protocol",
        icon: "images/projects/snapstream/snapstream-icon.webp", 
        liveLink: null,
        sourceLink: null, 
        bannerImage: "images/projects/snapstream/snapstream-banner.webp",
        tags: ["CSharp", "Flutter", "Dart", "Data Protocol", "Offline First"],
        tldr: `
            <ul>
                <li>Developed SnapStream, an offline data-transfer protocol using QR codes</li>
                <li>Designed to transfer large data payloads in environments without reliable connectivity</li>
                <li>Implemented a sequence of rapidly changing QR codes to send data chunks</li>
                <li>Created a proof of concept in C# and final version in Flutter/Dart</li>
                <li>Successfully commercialised and adopted by major clients for field data transfer</li>
        `,
        details: `
            <h3>Project Overview</h3>
            <p>
                When I started at Blueberry Consultants, a client had a unique challenge - they needed to transfer large amounts of data
                between two tablets in a remote environment where method like Wi-Fi or Bluetooth were unreliable or unavailable. This was
                a crucial requirement for their application and my very first task was to find a solution.
            </p>
            
            <h3>Solution Design</h3>
            <p>
                One method of common data transfer is the usage of QR codes, but thanks to the low density of data that can be stored in a QR code,
                this is not a viable solution for large data transfers. Instead, I designed a protocol that uses a sequence of rapidly changing QR codes to transfer data in chunks.
                The idea is to get the data, compress it as much as possible, and then encode each chunk into a specially formatted QR code.
                The sending device displays these QR codes in a high speed sequence, while the receiving device uses its camera to read the stream of QR codes,
                reconstruct the data, and verify its integrity using checksums.
            </p>

            <h3>Implementation</h3>
            <p>
                The first step was to create a proof of concept in <b>C#</b>. This was actually primarily done to get me up to speed with the C# language
                as it's used heavily at Blueberry, but I have never used it before. The proof of concept was a simple Windows Forms application that could
                generate QR codes from a text input, display them in a sequence, and read them back using the camera.
            </p>

            <h4>Details of the protocol</h4>
            <p>
                The protocol works by first compressing the data using a lossless compression algorithm, and then converts the data into Base64 format.
                Each chunk of data is then assembled into a QR code which crucially includes the following components:
            </p>
            <ul>
                <li><b>Protocol Name and Version</b>: A simple string "SnapStream/1.0" to identify the protocol and its version.</li>
                <li><b>Chunk Index</b>: An integer representing the index of the chunk in the sequence, starting from 0.</li>
                <li><b>Total Chunks</b>: An integer representing the total number of chunks in the sequence.</li>
                <li><b>Checksum</b>: A checksum of the data chunk to verify its integrity.</li>
                <li><b>Data</b>: The Base64 encoded data chunk itself.</li>
            </ul>
            <p>
                This might seem like a lot of overhead but it is necessary to properly reconstruct the data on the receiving end and crucially, allows
                data to be sent in any order. This was important, as the devices used by the client were extremely slow and could not keep up with the 
                QR code sequencing without dropping frames, resulting in broken reconstruction of the data. That is why I designed the protocol to be resilient to this, allowing
                the receiving device to reconstruct the data even if some chunks are received out of order or some chunks are dropped.
            </p>

            <h3>Final Implementation</h3>
            <p>
                The final production version was a package built using <b>Flutter / Dart</b> for cross-platform deployment on mobile devices.
                This was chosen as it allowed for a single codebase to be used for both Android and iOS, and the Flutter framework provided a rich set of libraries for QR code generation and camera access
                This also allowed for easy integration with any of the existing mobile apps we had created for any client at Blueberry Consultants.
            </p>
            <img class="projectImageVerticalImage" src="images/projects/snapstream/snapstream-demo.gif" alt="SnapStream demo">
            <h3>Outcome</h3>
            <p>
                The SnapStream protocol was extremely well received and has been successfully commercialised.
                With it receiving praise on LinkedIn and now being the main method of data transfer for this specific application, it was clear 
                this has its place in the world.
                For me personally, it was a way to prove myself in a new workplace and show my ability to innovate and deliver solutions under pressure.
            </p>

        `
    },
    {
        id: "projectEvotech",
        name: "evotech;",
        shortDescription: "A robust, full-stack e-commerce platform built from scratch",
        icon: "images/projects/evotech/evotechLogo.webp",
        liveLink: "https://evotech.kalam.dev",
        sourceLink: "https://github.com/aston-cs2tp-evotech/evotech",
        bannerImage: "images/projects/evotech/evotechBanner.webp",
        tags: ["PHP", "Custom MVC", "MariaDB", "HTML", "CSS", "JavaScript", "CI/CD", "GitHub Actions", "Security", "Leadership"],
        tldr: `
            <ul>
                <li>Designed and led development of a full-stack e-commerce platform</li>
                <li>Built a custom lightweight PHP MVC framework to support structured and maintainable code</li>
                <li>Stepped in to single-handedly deliver the entire Admin Dashboard frontend & backend in just 3 days</li>
                <li>Implemented secure API endpoints, token-based auth, and dynamic admin tools</li>
                <li>Developed CI/CD pipeline, automated backups, and cross-platform deployment scripts</li>
                <li>Managed team workflows, reviewed all merges, and mentored teammates with no web experience</li>
            </ul>
        `,
        details: `
            <h3>Project Overview</h3>
            <p>
                <strong>evotech</strong> is a full-stack e-commerce web application built as part of my university's team project module in second year.
                The goal was to create a robust, production ready platform that fit specific user requirements that as a group we had to define.
                Some students created a pet store, others created a clothing store, but we decided to create a tech store that sold computer parts.
            </p>

            <h3>Custom MVC Framework</h3>
            <p>
                At Aston University, we had a dedicated module in first year that taught us the fundamentals of web development, including
                the Model-View-Controller (MVC) architecture and how to build web applications using PHP, HTML, CSS, and JavaScript. This 
                was a mandatory module for all Computer Science and Cyber Security students, so at the start of the project, I assumed
                my peers would have a good understanding of how to build web applications.
            </p>
            <p>
                To further simplify development for everyone involved, I created a custom lightweight PHP MVC framework that provided 
                a structured way to build the application. This framework included:
            </p>
            <ul>
                <li>A routing system baked into the index.php file that mapped URLs to controller actions</li>
                <li>A base controller class that provided common functionality like rendering views and handling requests</li>
                <li>A model class that handled database interactions using prepared statements</li>
                <li>A view system that allowed for easy templating and dynamic content rendering</li>
                <li>Built-in error handling and logging to simplify debugging</li>
                <li>Authentication system with tokens</li>
                <li>Generation of API tokens for external use</li>
            </ul>
            <p>
                Fundamentally this meant those working on the front end (where our less experienced peers were) could
                focus on HTML, CSS, and JavaScript without worrying about the underlying PHP logic - something most of my peers 
                had chosen to skip. 
            </p>
            <italic>
                This was a flaw of the way first year modules were set up; students only required 40%
                of a module total to pass, and there is no incentive to get higher than that. This meant that after the
                basic web development assessment (HTML, CSS, JS) and the database assessment (SQL), the final assessment of using
                PHP and integrating basic web dev with a database was not taken seriously by most students and in a lot of cases, not even attempted.
            </italic>

            <p>
                Additionally, I created a guide to teach everyone how to use Git and how it integrates with our GitHub repository, as well 
                as spending one to one time with those who had never used Git before.
            </p>

            <h3>Emergency Admin Dashboard Rebuild</h3>
            <p>
                Mid-project, one of the members of the team who was responsible for the Admin Dashboard, had decided to go 
                on holiday for 2 months, assuring us he would be able to commit the code from India whilst he was away.
                The more I pressed on this, the more excuses I received, primarily saying that he has completed it but
                the Internet speed in India was too slow to upload the code.
            </p>
            <p>
                When he finally returned back to the UK, he put his hands up and said actually he had not done
                any of the work and had not even started it. When I asked to see it, he had quickly generated code using
                ChatGPT that was not functional, and had not even bothered to test it as well as looking completely different
                to the designs.
            </p>
            <p>
                At this moment in time, with a close deadline looming, I had to step in and take over the entire Admin Dashboard
                since I would've been responsible with tying it to the backend anyway. I had 3 days to complete the entire
                Admin Dashboard, which included:
            </p>
            <ul>
                <li>Designing the entire frontend using HTML, CSS, and JavaScript</li>
                <li>Implementing the backend logic in PHP to handle all the CRUD operations</li>
                <li>Creating the database schema and writing the SQL queries to interact with the database</li>
                <li>Integrating the frontend and backend to ensure everything worked together</li>
                <li>Creating an API token management system (for example to allow scanners to control stock levels)</li>
                <li>Implementing a secure authentication system to protect sensitive routes</li>
            </ul>

            <img src="images/projects/evotech/evotech-admin.webp" alt="Admin Dashboard" class="projectImage">

            <h3>Infrastructure, Testing, and DevOps</h3>
            <p>
               
            <h3>Security and Robustness</h3>
            <p>
                Security was a huge consideration for an e-

            <h3>Team Management and Mentorship</h3>
            <p>
                Beyond the code, I managed the entire development process:
            </p>
            <ul>
                <li>Created project workflows in Trello and Discord, and managed all technical communication</li>
                <li>Authored project documentation including guides, onboarding and README.MD</li>
                <li>Conducted code reviews, debugged issues for other subteams, and handled cross-functional blockers</li>
            </ul>

            <h3>Outcome</h3>
            <p>
                The project was a huge success, with the final product being a fully functional e-commerce platform that met all the requirements set out at the start of the project.
                The platform was well-received by the examiner as well as by people I show the site to.
            </p>
            <ul>
                <li>Every member achieved a high mark for this project (based on their contribution)</li>
                <li>I received a first class mark for my contribution, with the examiner praising my leadership and technical skills</li>
                <li>The project was considered to be one of my best pieces when I was interviewing for placements</li>
            </ul>
            <p>
                Overall, this project was a great learning experience for me, as it allowed me to apply my 
                knowledge of web development in a real world scenario, but crucially, it taught me how to manage a team of developers,
                and how to deliver a project from start to finish under pressure.
            </p>
        `
    },
    {
        id: "projectLazyDSiFileDownloader",
        name: "Lazy DSi File Downloader",
        shortDescription: "A tool for automated homebrew setup on Nintendo DSi systems",
        icon: "images/projects/lazy-dsi-file-downloader/lazydsifiledownloadericn.webp",
        liveLink: null,
        sourceLink: "https://github.com/YourKalamity/lazy-dsi-file-downloader-archive",
        bannerImage: "images/projects/lazy-dsi-file-downloader/lazy-dsi-file-downloader.webp",
        tags: ["Python", "GitHub Actions", "Tkinter"],
        details: `
            <p>Lazy DSi File Downloader was created in order to simplify the homebrew process outlined in <a href="https://dsi.cfw.guide/">dsi.cfw.guide</a></p>
            <p>The naming was due to the fact that I felt too <i>lazy</i> to manually copy each of the files for each of my DSi systems I modded</p>
            <p>Instead I spent even longer developing this app to automatically do all of this.</p>
            <p><b>Features</b></p>
            <ul>
                <li>Download and install the appropriate <a href="https://gbatemp.net/threads/memory-pit-a-new-dsi-exploit-for-dsi-camera.539432/">memory pit</a> exploit corresponding to the DSi firmware version</li>
                <li>Download and install / update TWiLight Menu++</li>
                <li>Download and install the latest version of dumpTool</li>
                <li>Download and install the latest version of Unlaunch</li>
                <li>Detect and update an existing hiyaCFW installation</li>
                <li>And install a larger list of homebrew</li>
            </ul>
            <p>To handle the larger list of homebrew, I created a separate repository with a list of homebrew, download links, and instructions for my software to follow. This extensibility meant that more homebrew could be added to the download list whilst keeping the size of Lazy DSi File Downloader small.</p>
            <p>However, due to the security measures put in place on Windows, it became *more* difficult to use the app for new users... This ultimately led to the archival of the project.</p>
        `
    },
    {
        id: "projectSenpai",
        name: "Senpai",
        shortDescription: "A Discord chat bot with versatile features",
        icon: "images/projects/senpai/senpai.webp",
        liveLink: null,
        sourceLink: "https://github.com/YourKalamity/senpai",
        bannerImage: "images/projects/senpai/senpai-demo.gif",
        tags: ["Python", "sqlite", "discord.py"],
        details: `
            <p><i>Senpai in action, searching for a supplied image via its Anime lookup function</i></p>
            <p>Senpai is a Discord bot that I wrote initially as a form of experimentation and to better understand Discord bots in general</p>
            <p>Initially it was just a very basic bot... It then evolved into a bot capable of performing maths and more complex things.</p>
            <p>I created a Senpai command to automatically take any image and convert it to the proper format for the Nintendo DSi Unlaunch exploit background, whilst also taking a parameter to select whether or not dithering should be used.</p>
            <p>Senpai then went through a major redesign and rewrite from the ground up, she now lives on a much more powerful Ubuntu VPS.</p>
            <p>The current set of features include :</p>
            <ul>
                <li>Stars - A system that uses senpais database to track how many stars a user has collected in a server (based on how many "star" reactions on their message)</li>
                <li>Conversion - A system that converts between file types</li>
                <li>Anime - A system that allows users to use any screencap of an anime and find out the exact show, episode, season and a small clip of the specified image</li>
            </ul>
        `
    },
    {
    id: "projectNhsScripts",
    name: "NHS Reporting Scripts",
    shortDescription: "Automated Reporting Pipeline for NHS Telephony Providers",
    icon: "images/projects/nhs-reporting/nhs-reporting.webp",
    liveLink: null,
    sourceLink: null,
    bannerImage: "images/projects/nhs-reporting/nhs-reporting-banner.webp",
    tags: [
        "Python", "PowerShell", "MS SQL", "JWT Auth",
        "ETL", "Automation", "Windows Task Scheduler", "CSV/XLSX"
    ],

    tldr: `
        <ul>
            <li>Designed & delivered a fully automated reporting pipeline for 150+ GP practices across England</li>
            <li>Reverse-engineered an undocumented, rate-limited API that silently truncated data</li>
            <li>Built custom interval logic to match NHS spec</li>
            <li>Implemented resilient JWT token refresh, error detection & email alerting</li>
            <li>Orchestrated with Windows Task Scheduler</li>
        </ul>
    `,

    details: `
        <h3>Project&nbsp;Overview</h3>
        <p>
            The NHS had mandated a new set of reports to be produced at the end of the report from every telephony
            provider that work with GP surgeries, to give the NHS a better understanding of the demand and weakpoints
            in the system. One of these telephony providers, asked Blueberry Consultants to create a fully automated
            pipeline to pull the data from their reporting API and at the end of the month, generate the reports, ready
            to send directly to the NHS.
        </p>
        <p>
            I was selected to be the sole developer on this project thanks to my experience with Python and PowerShell,
            and at the time, it was thought to be a simple 1 week project.
        </p>

        <h3>"Endless Suffering"</h3>
        <p>
            Despite the semingly easy nature of the project, it quickly became apparent that the API was
            incredibly poorly documentated, and the API itself was not designed to be used in the way we
            needed it to be used. For starters, the contact from the client had provided me with a Postman
            collection and the filename was titled "Endless Suffering". It was not hyperbole.
        </p>
        <p>
            Firstly, the API had incredibly poor documentation, it was setup on Swagger, but only the bare 
            minimum was provided. For example, the API to "generate a report" (collect the call data for
            a given time period) provided only details on the names of the parameters to be provided, but without
            explaining what exactly was expected or how to format it. For example, to get a report for a specific
            set of practices, the API required a parameter called "sites" which was a list of IDs that corresponded to
            the practices.
        </p>
        <p>
            Upon further investigation : 
        </p>
        <ul>
            <li>"sites" was actually a <italic>pipe (|)</italic> separated list of IDs</li>
            <li>This is in contrast to other parameters which were comma (,) separated</li>
            <li>Another parameter was <italic>semicolon (;)</italic> separated but again no explanation was given</li>
            <li>Even more maddening, there was 3 separate IDs that could be the practice ID, but again not clear which one to use</li>
        </ul>
        <p>
            And that was just <strong>one</strong> paramter of <strong>one</strong> API endpoint. Some fo the other
            problems I found were :
        </p>
        <ul>
            <li>To grab a report for a specific practice, all the phone numbers the practice uses had to be provided</li>
            <li>There was an endpoint to get <strong>all</strong> the phone numbers <italic>for every single practice</italic>
            in the system.
            <li>None of these phone numbers <italic>had a link to the practice ID</italic> whatsoever.</li>
            <li>A siteID was provided with each phone number, but this was not the same as the practice ID</li>
            <li>I assumed at first, that providing phone numbers that did not belong to the practice would error.</li>
            <li>Instead, it would just ignore the phone numbers that did not belong to the practice</li>
            <li>There was no way to know which phone numbers were ignored</li>
        </ul>
        <p>
            And the other problems :
        </p>
        <ul>
            <li>If <strong>too much</strong> data was requested, the API would silently truncate the data</li>
            <li>There was no way to know if the data was truncated - no error, no warning, nothing</li>
            <li>The script would carry on unaware that the data was incomplete</li>
            <li>Additionally, the API took an extremely long time to respond, often taking 20 minutes at first</li>
            <li>Then when more practices were added, it took over 3 hours to respond</li>
            <li>With the truncation problem, pulling the data had to be split into smaller chunks</li>
            <li>But the API did not allow concurrent requests, so each chunk had to be pulled sequentially</li>
            <li>Development was difficult as the only way to test data was to wait for the complete response</li>
        </ul>
        <p>
            As can be seen, the API was not designed to be used in the way we needed it to be used, and 
            the documentation was not helpful in understanding how to use it. This led to a lot of trial and error,
            and a lot of wasted time trying to figure out how to use the API.
        </p>

        <h3>Reverse Engineering</h3>
        <p>
            Eventually, through trial and error in a test python script, I was able to figure out how to use the API
            and get the data we needed. This involved reverse engineering the API to understand how it worked
            and what parameters were expected. I had to figure out the correct format for the parameters, trying different
            things until the data I needed was returned. This was a very time consuming process, and I had a lot of pressure
            on me as the client was expecting the project to be completed in a week, and I was already running way behind schedule.
        </p>
        
        <h3>Building the Pipeline</h3>
        <p>
            Once I had figured out how to use the API, I was able to build the pipeline to pull the data and generate the reports.
            The pipeline was built using Python and PowerShell, with Python being used to pull the data from the API and PowerShell
            being used to automate the process of running the scripts necessary to generate the reports. 
        </p>
        <ol>
            <li>First, at 3:00 AM everyday, the powershell script called the Python script to pull the data from the API</li>
            <li>The Python script would then pull the data from the API</li>
            <li>It would then insert the data into a local MS SQL database</li>
        </ol>

        <h3>Report Generation</h3>
        <p>
            At the end of the month, the reports had to be generated ready to be sent to the NHS. This of course, like 
            the data pull, was not a simple task. The reports were formatted in a strange way, and the fields did not directly
            match with the data pulled from the API. This meant a lot of data transformation had to be done as well as a lot of
            assumptions made about the data.
        </p>
        <p>
            One of the most challenging aspects was the specific formatting requirements for the NHS reports. The NHS had
            defined a complex structure using what they called "CBT" buckets, which required data to be
            split across multiple dimensions:
        </p>
        <ul>
            <li><strong>Day Buckets</strong>: Each day of the month (1-31) needed to be reported separately</li>
            <li><strong>Time Buckets</strong>: Each day was split into 21 specific time intervals, ranging from large blocks like "00:00:00-05:59:59" to smaller 15-minute segments during peak hours (e.g., "08:15:00-08:29:59")</li>
            <li><strong>Sub-Buckets</strong>: Within each time period, data had to be further categorized by duration ranges (e.g., calls answered within 0 seconds, 1-30 seconds, 31-60 seconds, etc.)</li>
        </ul>
        <p>
            This meant that a single metric like "Time to Answer Call" would generate over 1,800 individual data points per practice per month
            (31 days x 21 time intervals x 9 duration buckets). The reporting format required each data point to have a unique identifier
            following the pattern "CBT003_Day-15_08:15:00_08:29:59_31_60" to represent calls answered on day 15, between 8:15-8:29 AM, 
            that took 31-60 seconds to answer.
        </p>
        <p>
            To handle this complexity, I implemented a sophisticated data transformation pipeline that:
        </p>
        <ul>
            <li>Converted timestamps into day indices and time bins using pandas</li>
            <li>Applied duration-based bucket assignment functions for sub-categorization</li>
            <li>Used MultiIndex operations to ensure all possible combinations were represented (even with zero values)</li>
            <li>Generated the specific submission names required by the NHS specification</li>
        </ul>
        <p>
            The final challenge was that some report types (like "Inbound Calls") were calculated by summing multiple other report types,
            requiring careful coordination to avoid double-counting while ensuring all the complex bucket relationships were maintained.
        </p>

        <h3>Error Handling and Monitoring</h3>
        <p>
            Given the critical nature of NHS reporting and the complexity of the data pipeline, I implemented comprehensive
            error handling and monitoring:
        </p>
        <ul>
            <li>Automated email alerts with log file attachments when errors occurred</li>
            <li>JWT token refresh logic to handle API authentication expiry</li>
            <li>Progress bars and detailed logging for long-running operations</li>
            <li>Data validation to detect API truncation and incomplete responses</li>
        </ul>

        <h3>Optimising using Vectorisation</h3>
        <p>
            The initial implementation of the data transformation pipeline was functional but suffered from performance issues,
            particularly when processing large datasets. The use of nested loops and iterative operations made the code slow
            and inefficient, especially when handling the complex multi-dimensional data required for NHS reporting.
        </p>
        <p>
            To address these bottlenecks, I reimplemented the logic using vectorised operations with the pandas library.
            This approach allowed me to leverage the power of C under the hood, enabling operations on entire arrays of data at once rather than iterating through individual elements.
            This made report generation go from taking 3 hours to 12 minutes, a significant improvement in performance.
        </p>
        
        <h3>Outcome</h3>
        <p>
            The project was delivered and successfully deployed to production and has been running since November 2024.
            Occasionally the NHS demand changes, and the API has to be updated to match the new requirements, 
            but the core pipeline remains intact and is still used to generate the reports.
        </p>
        <p>
            This project was a great learning experience for me, as it allowed me to work with real
            world APIs, data transformation, and reporting. It also taught me the importance of error handling and monitoring in production systems,
            as well as the power of vectorised operations for performance optimisation.
        </p>
        
        
    `
}];