import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller()
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get('articles')
  listArticles() {
    return this.knowledge.listArticles();
  }

  @Get('articles/:id')
  getArticle(@Param('id') id: string) {
    return this.knowledge.getArticle(id);
  }

  @Post('articles')
  createArticle(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.knowledge.createArticle(body, this.user(headers));
  }

  @Put('articles/:id')
  updateArticle(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>) {
    return this.knowledge.updateArticle(id, body, this.user(headers));
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.knowledge.deleteArticle(id, this.user(headers));
  }

  @Get('categories')
  listCategories() {
    return this.knowledge.listCategories();
  }

  @Post('categories')
  createCategory(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.knowledge.createCategory(body, this.user(headers));
  }

  @Get('search')
  search(@Query('q') query = '') {
    return this.knowledge.search(query);
  }

  @Post('favorites')
  favorite(@Body('articleId') articleId: string, @Headers() headers: Record<string, string>) {
    return this.knowledge.favorite(articleId, this.user(headers));
  }

  @Get('activity')
  activity() {
    return this.knowledge.activity();
  }

  @Get('versions')
  versions(@Query('articleId') articleId?: string) {
    return this.knowledge.articleVersions(articleId);
  }

  @Post('restore-version')
  restore(@Body('articleId') articleId: string, @Body('versionId') versionId: string, @Headers() headers: Record<string, string>) {
    return this.knowledge.restoreVersion(articleId, versionId, this.user(headers));
  }

  @Get('tags')
  listTags() {
    return this.knowledge.tags();
  }

  private user(headers: Record<string, string>) {
    return {
      id: headers['x-user-id'] || 'u1',
      role: (headers['x-user-role'] as 'Admin' | 'Manager' | 'Employee') || 'Admin',
      email: headers['x-user-email']
    };
  }
}
