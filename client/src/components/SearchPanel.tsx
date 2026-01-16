"use client";

import { useState } from "react";
import { searchWeb, searchLearningResources } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, BookOpen, Loader2 } from "lucide-react";

export default function SearchPanel() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [webResults, setWebResults] = useState<any>(null);
    const [learningResults, setLearningResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("web");

    const handleWebSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const data = await searchWeb(query);
            setWebResults(data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLearningSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const data = await searchLearningResources(query);
            setLearningResults(data);
        } catch (error) {
            console.error("Learning search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (activeTab === "web") {
            handleWebSearch();
        } else {
            handleLearningSearch();
        }
    };

    return (
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Search Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="Search for tutorials, articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="web" className="text-sm sm:text-base">
                Web Search
              </TabsTrigger>
              <TabsTrigger value="learning" className="text-sm sm:text-base">
                Learning Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="web" className="mt-4">
              {webResults?.success && (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Found {webResults.searchInfo?.totalResults} results
                    {webResults.searchInfo?.timeTaken &&
                      ` in ${webResults.searchInfo.timeTaken}`}
                  </p>
                  {webResults.results.map((result: any, idx: number) => (
                    <Card
                      key={idx}
                      className="hover:bg-accent transition-colors"
                    >
                      <CardContent className="p-3 sm:pt-4 sm:p-4">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <h3 className="font-semibold text-lg group-hover:text-primary flex items-start gap-2">
                            {result.title}
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.snippet}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new URL(result.url).hostname}
                          </p>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {webResults && !webResults.success && (
                <p className="text-sm text-destructive">
                  {webResults.error || "Search failed"}
                </p>
              )}
            </TabsContent>

            <TabsContent value="learning" className="mt-4">
              {learningResults?.success && (
                <div className="space-y-6">
                  {/* Articles */}
                  {learningResults.resources.articles?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tutorials & Articles
                      </h3>
                      <div className="space-y-2">
                        {learningResults.resources.articles.map(
                          (article: any, idx: number) => (
                            <Card
                              key={idx}
                              className="hover:bg-accent transition-colors"
                            >
                              <CardContent className="pt-3 pb-3">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-start gap-2"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium group-hover:text-primary">
                                      {article.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {article.snippet}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </a>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documentation */}
                  {learningResults.resources.documentation?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Official Documentation
                      </h3>
                      <div className="space-y-2">
                        {learningResults.resources.documentation.map(
                          (doc: any, idx: number) => (
                            <Card
                              key={idx}
                              className="hover:bg-accent transition-colors"
                            >
                              <CardContent className="pt-3 pb-3">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2"
                                >
                                  <span className="font-medium group-hover:text-primary flex-1">
                                    {doc.title}
                                  </span>
                                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tutorials */}
                  {learningResults.resources.tutorials?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Interactive Tutorials
                      </h3>
                      <div className="space-y-2">
                        {learningResults.resources.tutorials.map(
                          (tutorial: any, idx: number) => (
                            <Card
                              key={idx}
                              className="hover:bg-accent transition-colors"
                            >
                              <CardContent className="pt-3 pb-3">
                                <a
                                  href={tutorial.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2"
                                >
                                  <span className="font-medium group-hover:text-primary flex-1">
                                    {tutorial.title}
                                  </span>
                                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {learningResults && !learningResults.success && (
                <p className="text-sm text-destructive">
                  {learningResults.error || "Search failed"}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
