#!/usr/bin/env python3
"""
Batch translation script for all review files
Processes all review files in the sentiment_data directory structure
"""

import os
import glob
from translate_reviews import ReviewTranslator

def find_review_files(base_dir="../data/raw_reviews/oct_2025"):
    """Find all review JSON files that need translation"""
    pattern = f"{base_dir}/**/*_reviews.json"
    files = glob.glob(pattern, recursive=True)
    
    # Filter out files that are already English versions
    non_english_files = [f for f in files if not f.endswith('_ENG.json')]
    
    return non_english_files

def batch_translate():
    """Translate all review files to English"""
    print("🔄 Starting batch translation of review files")
    print("=" * 50)
    
    # Initialize translator
    try:
        translator = ReviewTranslator()
    except Exception as e:
        print(f"❌ Failed to initialize translator: {e}")
        return
    
    # Find all review files
    review_files = find_review_files()
    
    if not review_files:
        print("❌ No review files found")
        return
    
    print(f"📁 Found {len(review_files)} files to process:")
    for file in review_files:
        print(f"  - {file}")
    print()
    
    # Process each file
    processed_count = 0
    for input_file in review_files:
        try:
            # Create output filename
            base_name = input_file.replace('.json', '')
            output_file = f"{base_name}_ENG.json"
            
            # Check if English version already exists
            if os.path.exists(output_file):
                print(f"⏭️  Skipping {input_file} (English version exists)")
                continue
            
            # Process the file
            translator.process_review_file(input_file, output_file)
            processed_count += 1
            
        except Exception as e:
            print(f"❌ Error processing {input_file}: {e}")
            continue
    
    print(f"\n✅ Batch translation complete!")
    print(f"📊 Processed {processed_count} files")

def main():
    batch_translate()

if __name__ == "__main__":
    main()
