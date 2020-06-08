import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: 'FP', content: 'This is FP' },
  //   { title: 'SP', content: 'This is SP' },
  //   { title: 'TP', content: 'This is TP' },
  // ];
  posts: Post[] = [];
  private postSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private authListenerSubs: Subscription;
  userIsAuthendicated;
  userId: string;

  constructor(
    public postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postSub = this.postService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
        this.isLoading = false;
      });

    this.userIsAuthendicated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuth) => {
        this.userIsAuthendicated = isAuth;
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  onDelete(postId) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(
      () => {
        this.postService.getPosts(this.postsPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }
}
