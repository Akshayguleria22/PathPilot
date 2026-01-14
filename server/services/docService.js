const TRUSTED_DOMAINS = [
    "geeksforgeeks.org",
    "tutorialspoint.com",
    "w3schools.com",
    "nptel.ac.in",
    "mit.edu",
    "developer.mozilla.org",
    "docs.python.org",
    "reactjs.org",
    "vuejs.org",
    "angular.io"
];

export function filterDocs(articles) {
    return articles
        .filter(a => a.url && TRUSTED_DOMAINS.some(d => a.url.includes(d)))
        .map(a => ({
            title: a.title,
            url: a.url,
            snippet: a.snippet || a.description || "",
            type: "doc",
            source: "documentation"
        }));
}
