import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { PostServiceService } from '../post-service.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeTypeValidator } from './mime-type.validator';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit{
  enteredContent = "";
  enteredTitle = "";
  post?: Post;
  isLoading = false;
  form: FormGroup  = new FormGroup({})
  imagePreview?: string
  private mode = "create";
  private postId?: string | null;
  

  constructor(public postsService: PostServiceService, private route: ActivatedRoute){}


  ngOnInit() {
    this.form = new FormGroup({
        title: new FormControl(null, {
          validators: [Validators.required, Validators.minLength(3)]
      }),
        content: new FormControl(null, {
          validators: [Validators.required]
      }),
        image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeTypeValidator]})
      
    });
    this.route.paramMap.subscribe((paramMap: ParamMap)=>{
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        if(this.postId){
          this.postsService.getPost(this.postId).subscribe(postData => { 
            this.isLoading = false;
            this.post = {id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath};
            if(this.post?.id)
            this.form.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            });
          });
        }
      }else{
        this.mode = 'create';
        this.postId = undefined;
      }
    });
  }

  onImagePicked(event: Event){
      const file = (event.target as HTMLInputElement).files;
      if(file?.length != null){
        const firstFileElement = file[0];
        this.form.patchValue({image: firstFileElement});
        this.form.get('image')?.updateValueAndValidity();
        const reader = new FileReader();
        reader.onload= () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(firstFileElement);
      }
  }

  onSavePost(){
    if(this.form.invalid)
    {
      return;
    }
    this.isLoading = true;
    if(this.mode === 'create'){
      this.postsService.addPost(
        this.form.value.title, 
        this.form.value.content, 
        this.form.value.image
        );
    }else{
      if(this.postId)
      this.postsService.updatePost(
        this.postId, 
        this.form.value.title, 
        this.form.value.content, 
        this.form.value.image
        );
    }
    this.form.reset();
  }
}
